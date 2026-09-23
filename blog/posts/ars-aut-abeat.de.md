# Ars Aut Abeat: den Uncanny Valley messen statt darüber zu reden

Eine interaktive Installation, die misst, wie tief Besucher in den Uncanny Valley fallen. Gezeigt am 19.09.2026 auf der Langen Kunstnacht in Landsberg am Lech, im Rahmen des **TTZ Data Science und Autonome Systeme** der THA, unter dem Abendthema „Automatisierte Kunst".

Auf der Leinwand heißt sie **VALLIS · SIMVLACRI**, das Tal der Ähnlichkeit. Man stellt sich davor, hebt beide Hände, schaut sechs Sekunden lang ein Bildnis an, und bekommt ein Urteil auf Latein.

## Mori, 1970

Masahiro Mori hat beschrieben, was passiert, wenn etwas uns immer ähnlicher wird: die Sympathie steigt, und dann, kurz vor der vollen Menschenähnlichkeit, kippt sie um. Nicht in Gleichgültigkeit, sondern in Abscheu. Das ist der Uncanny Valley.

Darüber wird viel geredet und wenig gemessen. Die Installation dreht das um: sechs Bildnisse, angeordnet entlang genau dieser Achse, von unverdächtig bis unheimlich.

| Bildnis | Was es ist |
|---|---|
| **Imago Vera** | Fotografie |
| **Icon Picta** | gemaltes Porträt |
| **Simulacrum Marmoreum** | Marmorbüste |
| **Effigies Cerea** | Wachsfigur |
| **Vultus Syntheticus** | KI-generiertes Gesicht |
| **Automaton** | Animatronic |

Die Reihenfolge ist die Hypothese. Ob die Gesichter der Besucher ihr folgen, ist die Frage.

## Was passiert, wenn man davorsteht

Eine Zustandsmaschine mit sechs Phasen, alle Dauern in `config.py`.

| Phase | Dauer | Was passiert |
|---|---|---|
| **IDLE** | offen | Man sieht sich selbst im Spiegel, formatfüllend |
| **LOCKED** | 2,5 s | Beide Hände über die Schultern, 1,5 s ruhig halten, dann rastet es ein |
| **VIEWING** | 6 s | Das Bildnis im vergoldeten Rahmen, daneben die Emotionen live auf Latein |
| **VERDICT_PERSONAL** | 8 s | Die eigene Aufschlüsselung, besiegelt in Wachs |
| **VERDICT_COLLECTIVE** | 8 s | *Vox Populi*: das Urteil aller bisherigen Besucher, und wie nah man daran liegt |
| **FADE** | 3 s | „The valley awaits the next soul." |

Kein Knopf, kein Touchscreen, keine Erklärung, die jemand lesen muss. Hände heben ist die einzige Geste, und sie funktioniert auch bei jemandem, der von hinten in die Menge geschoben wird.

## Wie gemessen wird

Keine TensorFlow-Emotionsmodelle, kein DeepFace. MediaPipe FaceLandmarker liefert 52 Blendshapes, also FACS-Aktionseinheiten, und daraus werden sieben Emotionen gebaut. Jede bekommt ein Gewicht, das sagt, wie stark sie für ein Tal spricht.

![Die Gewichte und die drei Urteilsbänder](../blog/img/ars-aut-abeat-methode.png)

*Ekel ist das Kernsignal und wiegt am schwersten. Freude zieht genauso stark in die Gegenrichtung. Zorn ist fast neutral, weil er im Gesicht zu nah an Konzentration liegt.*

Der Score ist die gewichtete Summe, normalisiert auf 0 bis 1. Darüber liegen drei Bänder: unter 0,40 **FIRMA**, fester Boden. Bis 0,60 **LIMEN**, auf der Schwelle. Darüber **VALLIS**, im Tal.

Dazu kommt eine Blickprüfung, damit nicht jedes Gesicht im Bild mitgezählt wird, das gerade woanders hinschaut: Kopfpose über `solvePnP` mit sechs Landmarken, und nur wer weniger als 35 Grad zur Seite und 30 Grad nach oben oder unten schaut, gilt als zugewandt.

## Der Teil, der wirklich schwierig war

Nicht die Emotionen. Die Nebenläufigkeit.

Der WebRTC-Callback `recv()` muss unter etwa 16 Millisekunden zurückkehren, sonst ruckelt das Bild. MediaPipe braucht deutlich länger. Also legt `recv()` den Frame nur in einen Puffer und kehrt sofort zurück, und ein Daemon-Thread liest mit 10 Hz aus diesem Puffer und rechnet. Der Streamlit-Hauptthread liest alle 750 bis 1500 ms einen Schnappschuss.

Zwei Dinge, die mich Abende gekostet haben und die ich deshalb aufschreibe:

**Das iframe.** Setzt man `position: fixed` auf den Elternknoten der WebRTC-Komponente, bricht Streamlits Größenprotokoll, und die Peer-Verbindung wird bei jedem Rerun neu ausgehandelt. MediaPipe initialisiert sich dann im Sekundentakt neu. Die Lösung ist, den Elternknoten in Ruhe zu lassen und `position: fixed` auf das iframe selbst zu setzen.

**Ein Race in einer Fremdbibliothek.** `streamlit-webrtc` prüft in `SessionShutdownObserver.stop()` eine Threadreferenz und dereferenziert sie sechs Zeilen später. Ein paralleler Aufruf kann sie dazwischen auf `None` setzen. `app.py` patcht die Methode und kopiert die Referenz zuerst in eine lokale Variable.

## Was die Pilotdaten sagen

Und hier wird es unbequem.

In der Datenbank liegen **45 Messungen aus drei Entwicklungstagen im April 2026**. Über alle zusammen:

| Emotion | Mittel |
|---|---|
| Gleichmut | 0,455 |
| Zorn | 0,173 |
| Freude | 0,139 |
| Überraschung | 0,133 |
| Trauer | 0,031 |
| Furcht | 0,024 |
| **Ekel** | **0,022** |

Gesamtscore: **0,382**. Also FIRMA, und zwar knapp unter der Schwelle.

Das ist ein Ergebnis, aber nicht das erhoffte. **Ekel ist das Signal, auf dem die ganze Messung steht, und es taucht praktisch nicht auf.** Ein Mittelwert von 0,022 bei einem Gewicht von 1,0 heißt, dass der Score in der Praxis fast vollständig von Gleichmut und Freude getrieben wird, also von den beiden Gewichten, die nach unten ziehen. Die Skala misst derzeit zuverlässiger, wer *nicht* ins Tal fällt, als wer.

Drei Gründe kommen infrage, und ich kann sie mit diesen Daten nicht trennen:

1. **Die Bildnisse sind zu harmlos.** Die 45 Messungen stammen aus drei Katalog-Generationen. Die ältesten sind Museumsstücke mit 30 Sekunden Betrachtungsdauer, dann kamen berühmte Gemälde, erst zuletzt der eigentliche Ähnlichkeits-Katalog. Ein Marmorkopf löst keinen Ekel aus, und das ist keine Erkenntnis über Mori, sondern über die Bildauswahl.
2. **Ekel ist im Gesicht schwer zu sehen.** `noseSneer` und `mouthPucker` sind kleine Bewegungen. Bei Projektionsabstand und Hallenlicht gehen sie im Rauschen unter.
3. **Menschen zeigen vor einer Kamera nichts.** Wer weiß, dass er gemessen wird, wird neutral. Der Gleichmut-Mittelwert von 0,455 ist auch das.

Punkt drei ist der, der mich am meisten beschäftigt, weil er die Methode selbst betrifft und nicht ihre Parameter.

## Ehrlich bleiben

**Die Daten der Kunstnacht sind hier noch nicht drin.** Was in diesem Beitrag steht, ist der Pilot. Die Messungen vom Abend liegen auf dem Ausstellungsrechner und werden nachgereicht. Sie sind der eigentlich interessante Datensatz, weil dort zum ersten Mal Leute davorstanden, die vorher nichts von dem Projekt wussten.

**Die Skala hat sich geändert.** Die Urteile hießen einmal ARS, ABEAT und DUBIUM, heute VALLIS, LIMEN und FIRMA. In den alten Datensätzen stehen noch die alten Labels. Wer die beiden Generationen zusammen auswertet, muss das mappen, sonst rechnet er über zwei verschiedene Systeme.

**45 Messungen sind keine Stichprobe.** Sie sind ein Funktionsnachweis. Jede Zahl oben ist als Größenordnung zu lesen und nicht als Ergebnis.

## Der Abend

Zwei Meter neben der Installation stand Karla, unser Unitree G1.

Das hat mir etwas geliefert, das ich nicht geplant hatte. Meine Installation braucht eine Kamera, sieben Gewichte und eine Schwelle, um den Effekt sichtbar zu machen. Karla braucht das nicht. Sie muss nur aufstehen und ein paar Schritte gehen, und man sieht ihn direkt in den Gesichtern im Raum.

Das spricht nicht gegen das Messen. Es sagt nur, wo der schwierige Teil liegt: nicht darin, den Effekt auszulösen, sondern darin, ihn so festzuhalten, dass man ihn später noch nachrechnen kann.

## Technik

`Python 3.12+` · `Streamlit` · `streamlit-webrtc` · `MediaPipe` (FaceLandmarker, PoseLandmarker) · `OpenCV` · `SQLAlchemy` · `SQLite`

Schrift Cinzel und Cormorant Garamond, Palette Tinte `#1C1410`, Pergament `#F4E8D0`, Gold `#C9A961`, Burgund `#6B2C2C`. Alle Größen über `clamp()`, weil dasselbe Layout auf einem Handy und auf einem Beamer lesbar sein muss.

Der Code liegt offen auf [GitHub](https://github.com/PascalMasny/ArsAutAbeat).

Drei PDFs zum Mitnehmen:

- **[One-Pager](../pdfs/ArsAutAbeat_OnePager.pdf)**, eine Seite, für den schnellen Überblick
- **[Systembeschreibung](../pdfs/ArsAutAbeat_System.pdf)**, wie es funktioniert: Zustandsmaschine, Nebenläufigkeit, Bewertung
- **[Auswertung der Pilotdaten](../pdfs/ArsAutAbeat_Auswertung.pdf)**, alle Zahlen aus diesem Beitrag und was ihnen im Weg steht
