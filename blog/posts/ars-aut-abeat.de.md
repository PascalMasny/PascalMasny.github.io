# Ars Aut Abeat: Ab welchem Bild ist Kunst keine Kunst mehr?

Eine interaktive Installation, die misst, bei welchem Bild Kunst für einen Menschen aufhört, Kunst zu sein. Nicht per Umfrage, sondern am Gesicht. Gebaut von **PLEB Art Consulting** im Modul Projekt 2 des Studiengangs Systems Engineering an der TH Augsburg, gezeigt an zwei Orten:

- **16.07.2026**, Vernissage „Engineering meets Arts" im Vöhlinschloss Illertissen
- **19.09.2026**, 27. Lange Kunstnacht in Landsberg am Lech, beim **TTZ Data Science und Autonome Systeme** der THA, unter dem Abendthema „Automatisierte Kunst"

Auf der Leinwand heißt sie **VALLIS · SIMVLACRI**, das Tal der Ähnlichkeit. Man stellt sich davor, hebt beide Hände und sieht zu, wie ein Gemälde in zehn Schritten zerfällt. Am Ende steht ein Urteil auf Latein: *ars aut abeat*, Kunst, oder sie gehe.

## Mori, 1970

Masahiro Mori hat beschrieben, was passiert, wenn etwas uns immer ähnlicher wird: Die Sympathie steigt, und dann, kurz vor der vollen Menschenähnlichkeit, kippt sie um. Nicht in Gleichgültigkeit, sondern in Befremden. Das ist der Uncanny Valley.

Darüber wird viel geredet und wenig gemessen. Die Installation dreht es um: Sie nimmt etwas, das eindeutig Kunst ist, ein klassisches Gemälde der menschlichen Figur, und lässt eine KI es so lange neu malen, bis es falsch wird. Die Frage ist nicht, ob das irgendwann nicht mehr Kunst ist. Die Frage ist, **wann**, und ob das bei allen an derselben Stelle passiert.

## Was passiert, wenn man davorsteht

| Phase | Dauer | Was passiert |
|---|---|---|
| **Ruhe** | offen | Man sieht sich selbst im Spiegel. Beide Hände 1,5 s heben startet die Sitzung, das ist auch das Einverständnis |
| **Baseline** | 19 s | Das unveränderte Original mit Titel und Beschreibung. Die Kamera mittelt das Gesicht zum persönlichen Ruhezustand: das eigene Gesicht vor echter Kunst |
| **Galerie** | 30 s | Zehn KI-Bilder, alle drei Sekunden eines, mit weicher Überblendung. Jedes Bild bekommt seine eigenen Messwerte |
| **Urteil** | 25 s | Original, das letzte Bild, das noch Kunst war (**ARS**), und der Bruchpunkt (**ABEAT**) nebeneinander, darunter die eigene Reaktionskurve |

Kein Knopf, kein Touchscreen, keine Anleitung, die jemand lesen muss. Wer bei keinem Bild reagiert, bekommt **ARS MANSIT**: Für dich blieb es Kunst. Und auf dem Urteil steht: *Diese Linie hast du gezogen, nicht die Maschine.*

Die zehn Bilder entstehen vorab mit Stable Diffusion img2img. Bild 1 bis 5 werden jeweils direkt aus dem Original erzeugt, mit wachsender Stärke. Ab Bild 6 geht jedes Ergebnis wieder in die KI: ein echter Model Collapse, bei dem sich Fehler aufschaukeln, bis die Farbe zerfällt, während die Komposition noch steht.

## Wie gemessen wird

MediaPipe FaceLandmarker liefert pro Kamerabild 52 Blendshapes, also FACS-Aktionseinheiten, und daraus werden sieben Emotionen gebaut. Entscheidend ist, *was* dann verglichen wird: nicht der absolute Emotionsmix, sondern **die Abweichung vom eigenen Ruhezustand**. Wer grundsätzlich ernst schaut, wird nicht dafür bestraft.

![Wie der Bruchpunkt gemessen wird](../blog/img/ars-aut-abeat-methode.png)

*Jede Emotion zählt, aber die klassischen Uncanny-Signale Ekel und Angst zählen am meisten. Das Bild mit der größten gewichteten Abweichung ist der Bruchpunkt. Liegt keine Abweichung über 0,08, gibt es keinen Bruchpunkt.*

Dazu kommt eine Blickprüfung, damit nicht jedes Gesicht im Bild mitgezählt wird, das gerade woanders hinschaut: Kopfpose über `solvePnP`, und nur wer weniger als 35 Grad zur Seite und 30 Grad nach oben oder unten schaut, gilt als zugewandt. Gespeichert werden keine Bilder und keine Gesichter, nur Emotionswerte, Urteil und Bruchstelle.

## Der Weg dahin

Die erste Fassung im April sah anders aus. Sechs Bildnisse entlang von Moris Achse, von der Fotografie über die Wachsfigur bis zum Animatronic, jeweils sechs Sekunden, und ein Score aus dem absoluten Emotionsmix. Gebaut war sie in Streamlit, und zwei Dinge daraus haben mich Abende gekostet:

**Das iframe.** Setzt man `position: fixed` auf den Elternknoten der WebRTC-Komponente, bricht Streamlits Größenprotokoll, und die Peer-Verbindung wird bei jedem Rerun neu ausgehandelt. MediaPipe initialisiert sich dann im Sekundentakt neu. Die Lösung war, `position: fixed` auf das iframe selbst zu setzen.

**Ein Race in einer Fremdbibliothek.** `streamlit-webrtc` prüft in `SessionShutdownObserver.stop()` eine Threadreferenz und dereferenziert sie sechs Zeilen später. Ein paralleler Aufruf kann sie dazwischen auf `None` setzen.

Die 45 Testmessungen dieser Fassung zeigten schon, was sich später bestätigt hat: Ekel, das Signal, auf dem die alte Skala stand, lag im Mittel bei 0,022. Ausgestellt wurde eine andere Fassung: FastAPI und React statt Streamlit, der Browser schickt die Kamerabilder per WebSocket an das Python-Backend, und statt eines absoluten Scores zählt der Bruchpunkt gegenüber der eigenen Baseline.

## Was die Daten sagen

In der Datenbank liegen **185 vollständige Besuche**: 82 aus Illertissen (antike Skulpturen, Büsten und Gefäße) und 103 aus Landsberg (Gemälde). Die Testläufe aus der Entwicklung sind herausgerechnet. Daraus lässt sich eine These prüfen:

> Die Grenze, an der ein Bild für uns aufhört, Kunst zu sein, liegt nicht am Anfang der Zerstörung, sondern in ihrer zweiten Hälfte. Und sie liegt für verschiedene Menschen, Orte und Motive an derselben Stelle.

![Bei welchem Bild die Reaktion am stärksten war](../blog/img/ars-aut-abeat-ergebnis.png)

| Aussage | Ergebnis | 95 % Konfidenzintervall |
|---|---|---|
| Besucher mit messbarem Bruchpunkt | 152 von 185 = **82 %** | 76 bis 87 % |
| Bruchpunkte in Bild 6 bis 10 (Zufall: 50 %) | 92 von 152 = **61 %** | 53 bis 68 %, p = 0,012 |
| Unterschied der mittleren Bruchstelle, Illertissen gegen Landsberg | **0,2 Bilder** | −0,8 bis +1,2, p = 0,77 |

Das heißt: Die große Mehrheit reagiert messbar, der Bruch kommt signifikant häufiger spät als früh, und das Muster wiederholt sich an zwei unabhängigen Orten mit anderem Publikum und anderen Motiven. Jeder Ort für sich liegt bei rund 60 % späten Bruchpunkten, ist allein aber zu klein für Signifikanz (p ≈ 0,08). Zusammen ist der Effekt signifikant. **Wo Kunst endet, scheint mehr vom Grad der Zerstörung abzuhängen als vom Bild oder vom Betrachter.**

Bei den Urteilen landen 70 % im Tal (VALLIS), 12 % auf der Schwelle (LIMEN) und 18 % auf festem Boden (FIRMA, *ars mansit*). Zwischen den Orten gibt es keinen signifikanten Unterschied (χ² p = 0,23).

## Ehrlich bleiben

**Die zeitliche Drift ist die wichtigste Gegenerklärung.** Je länger die Baseline zurückliegt, desto mehr weicht jedes Gesicht ohnehin davon ab, egal was gezeigt wird. Späte Bilder hätten dann automatisch höhere Werte. Mit den gespeicherten Daten lässt sich das nicht ausschließen. Ein Kontrolldurchlauf, der zehnmal das unveränderte Original zeigt, würde es klären.

**Der Gipfel bei Bild 1 und 2.** 33 Bruchpunkte liegen ganz am Anfang. Der erste Schnitt vom Original zu einem neuen Bild erzeugt vermutlich eine Überraschung. Die Messung erfasst also auch Reaktionen auf den Wechsel selbst.

**„Wütend" ist wohl Konzentration.** Wut liegt im Mittel bei 29 % und ist bei 58 Besuchen die stärkste Emotion. Wer genau hinsieht, senkt die Augenbrauen, und das Modell liest das als Wut. Ekel und Angst, die klassischen Uncanny-Signale, bleiben unter 5 %.

**Die These kam nach den Daten.** Die Teilung in zwei Hälften ist die naheliegendste Wahl, aber sie wurde nicht vorab festgelegt. Die nächste Ausstellung soll sie als echten Test prüfen.

## In der Zeitung

Das Landsberger Tagblatt hat über die Kunstnacht berichtet, mit Foto vor der Installation. Ein Satz daraus passt fast zu gut: *„Wir können heute Kunstwerke von künstlicher Intelligenz produzieren lassen, bei der Niemandem auffällt, dass sie nicht echt ist."* Die Daten sagen: Irgendwann fällt es doch auf, nur später, als man denkt.

## Der Abend

Zwei Meter neben der Installation stand Karla, unser Unitree G1 im Cosplay.

Das hat mir etwas geliefert, das ich nicht geplant hatte. Unsere Installation braucht eine Kamera, sieben Gewichte und eine Schwelle, um den Effekt sichtbar zu machen. Karla braucht das nicht. Sie muss nur aufstehen und ein paar Schritte gehen, und man sieht ihn direkt in den Gesichtern im Raum.

Das spricht nicht gegen das Messen. Es sagt nur, wo der schwierige Teil liegt: nicht darin, den Effekt auszulösen, sondern darin, ihn so festzuhalten, dass man ihn später noch nachrechnen kann.

## Warum Ingenieure Kunst machen

Zum Ende von Projekt 2 habe ich Constantin Wanninger gefragt, worum es in diesem Projekt eigentlich geht. Seine Antwort war eine Gegenfrage: „Was ist für dich ein Systems Engineer?" Ich war sprachlos. Irgendwas mit Maschinenbau, dachte ich. Dann kam der Satz, der hängen geblieben ist:

> „Ich will, dass ihr wie Daniel Düsentrieb werdet. Jemand, der sich jede Domäne nehmen und daraus etwas erschaffen kann."

Es ging also nie um Kunst allein. Für uns waren es gleich mehrere fremde Domänen: Kunstgeschichte, generative KI, Gesichtsanalyse und am Ende Statistik. Und der Name ist Programm: **PLEB** steht für Pascal Masny, Lukas Kraus, Erik Reusch und Baha Tombul. Vier Ingenieurstudenten, die nicht erklären können, warum ein Gemälde Millionen wert ist. Genau deshalb fragt die Installation nicht die Experten, wo Kunst endet, sondern jeden, der vor der Kamera steht.

## Technik

`Python` · `FastAPI` · `WebSocket` · `React` · `TypeScript` · `Vite` · `MediaPipe` (FaceLandmarker, PoseLandmarker) · `OpenCV` · `SQLAlchemy` · `SQLite` · `Stable Diffusion img2img`

Schrift Cinzel und Cormorant Garamond, Palette Tinte `#1C1410`, Pergament `#F4E8D0`, Gold `#C9A961`, Burgund `#6B2C2C`.

Der Code liegt offen auf [GitHub](https://github.com/PascalMasny/ArsAutAbeat).

Drei PDFs zum Mitnehmen:

- **[One-Pager](../pdfs/ArsAutAbeat_OnePager.pdf)**, eine Seite, wie die Installation funktioniert
- **[Systembeschreibung](../pdfs/ArsAutAbeat_System.pdf)**, Ablauf, Messung, Bruchpunkt und Technik im Detail
- **[Auswertung](../pdfs/ArsAutAbeat_Auswertung.pdf)**, alle 185 Besuche, die These, die Tests und was gegen sie spricht
