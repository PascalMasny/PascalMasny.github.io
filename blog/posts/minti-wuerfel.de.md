# MINTi Würfel: wenn der Nutzer zwei Jahre alt ist

Studienprojekt 1 an der THA, Wintersemester 2025/26, zu viert als Team **4CoreDynamics**. Die Aufgabe: ein Spielgerät für einen MINT-Spielplatz. Zielgruppe zwei bis sechs Jahre.

Herausgekommen ist ein Würfel mit sechs Seiten, von denen jede ein eigenes Experiment ist. Das Interessante daran war aber nicht die Elektronik.

## Zwei Sätze im Lastenheft, die alles andere bestimmt haben

Der erste: *intuitive Nutzung ohne Erklärung*. Kein Onboarding, kein Tooltip, keine Fehlermeldung, kein README. Der Nutzer kann nicht lesen. Wenn eine Seite erklärt werden muss, ist sie gescheitert, und man merkt es sofort, weil das Kind einfach weitergeht.

Der zweite: *sicher auch bei Fehlbedienung*. In der Softwarewelt ist Fehlbedienung der Randfall, den man am Ende noch abfängt. Bei Zweijährigen ist sie der Normalfall. Der Würfel wird nicht bedient, er wird geworfen, gedreht, angekaut und fallen gelassen.

Diese zwei Zeilen haben mehr Konstruktionsentscheidungen erzwungen als jedes technische Detail danach.

## Sechs Seiten, sechs Prinzipien

| Seite | Was Kinder dabei begreifen |
|---|---|
| **Theremin** | Abstand wird Tonhöhe, berührungslos |
| **Farbmischer** | additive und subtraktive Farbmischung im direkten Vergleich |
| **Getriebe** | Übersetzung, Drehrichtung, Kraftübertragung |
| **Labyrinth** | Schwerkraft, Gleichgewicht, Feinmotorik |
| **Solar** | Licht wird Strom wird Licht |
| **MINT-Märchen** | zwei Hörgeschichten auf Knopfdruck |

![Theremin-Seite](../blog/img/minti-theremin.png)

*Theremin: Der kleine schwarze Baustein in der Mitte ist der Abstandssensor. Die Symbole drumherum erklären die Bedienung ohne ein einziges Wort. Hand davor halten, hoch und runter bewegen, Ton ändert sich. Der Drehknopf unten regelt die Lautstärke.*

![Farbmischer-Seite](../blog/img/minti-farbmischer.png)

*Farbmischer: Oben drei drehbare Farbscheiben für die subtraktive Mischung, unten drei Potis für additives RGB-Licht. Beide Prinzipien sitzen bewusst auf derselben Seite, weil der Unterschied erst im Vergleich auffällt.*

![Getriebeseite](../blog/img/minti-getriebe.png)

*Zykloidgetriebe: Der orangene Exzenter in der Mitte treibt das Hohlrad an. Rein mechanisch, ohne Strom. Man kann es mit dem Finger anhalten, und genau darin liegt der Lerneffekt.*

![Labyrinth-Seite](../blog/img/minti-labyrinth.png)

*Kugellabyrinth: Die drei Zahnräder am Rand verstellen Wände im Inneren, damit sich der Schwierigkeitsgrad an das Kind anpassen lässt.*

![Solarseite](../blog/img/minti-solar.png)

*Das Solarmodul liegt oben auf dem Würfel und lädt den Akku. An einem Spielgerät für Zweijährige will man kein Netzkabel haben.*

![Märchen-Seite](../blog/img/minti-maerchen.png)

*MINT-Märchen: zwei Taster, zwei Geschichten. Die einzige Seite, auf der es etwas zu gucken statt zu begreifen gibt.*

Getriebe und Labyrinth sind rein mechanisch, komplett 3D-gedruckt, ohne eine einzige Zeile Code. Das war kein Verzicht, sondern der Punkt: Ein Zykloidgetriebe erklärt Übersetzung besser als jede Animation.

## Warum es ein Würfel ist

Ein Würfel hat sechs unabhängige Flächen, und genau das war die Architektur. Jede Seite rastet einzeln in den Rahmen ein, werkzeuglos, an beliebiger Position. Geht eine Seite kaputt, funktionieren die anderen fünf weiter. Modularität, aber in Kunststoff statt in Interfaces.

![Der Würfel von der anderen Seite](../blog/img/minti-cubus2.png)

*Farbmischer, Getriebe und Solarmodul in einer Ansicht. Der blaue Rahmen ist das einzige Bauteil, das alle Seiten gemeinsam haben.*

![Rast- und Drehpunkte an der Modulkante](../blog/img/minti-modul.png)

*Die zylindrischen Rastpunkte an der Kante jedes Moduls. Sie klicken beim Einsetzen in die Aufnahmen des Rahmens und bilden eine formschlüssige Lagerung, deshalb passt jedes Modul an jede Position.*

![Schnitt durch den Rahmen](../blog/img/minti-rahmen1.png)

*Schnittansicht der Rastgeometrie. Beim Einschieben weicht sie kontrolliert aus und federt danach zurück. Werkzeuglos montierbar, aber nicht mal eben von einem Kind wieder herauszuziehen.*

Der Rahmen ist aus hartem TPU (Shore D80) gedruckt, mit vier Stahlstangen darin. Das TPU gibt beim Einsetzen der Module elastisch nach und federt zurück, die Stangen sorgen dafür, dass das Ganze trotzdem ein Würfel bleibt und keine Gummisache. Die Module selbst sind PETG mit 50 % Gyroid-Infill, gewählt vor allem deshalb, weil sich PETG vor dem Bruch elastisch verformt. Ein Bauteil, das nachgibt, ist bei dieser Zielgruppe mehr wert als eines, das steif ist.

## Die Elektronik

Ein ESP32-C6 steuert die vier aktiven Seiten. Ein paar Details, die im Betrieb wirklich zählen:

- **Theremin:** Ein VL53L0X misst den Abstand, 50 mm bis 5000 mm werden *exponentiell* auf 120 Hz bis 2000 Hz abgebildet. Linear klingt falsch, weil Tonhöhe logarithmisch wahrgenommen wird. Erst mit der Exponentialkurve fühlt sich die Handbewegung nach Musik an statt nach Messwert.
- **Farbmischer:** Drei Potis auf 20 NeoPixel. Reagiert wird erst ab einer Änderung von 100 (von 4095), sonst flackert die Seite im Ruhezustand vor sich hin, weil der ADC rauscht.
- **Auto-Abschaltung:** Nach zehn Sekunden ohne Bewegung geht alles aus. Ein Lernwürfel, der nachts im Regal leuchtet, hat sein Batterieproblem selbst erschaffen.

Ehrlich bleiben gehört dazu: Fehlt der Abstandssensor beim Start, hängt die Firmware in einer Endlosschleife und es startet gar nichts. Das ist kein Feature, das ist eine offene Baustelle.

## Der Test

Zuerst der Laborteil: Eine Fünfjährige hat alle Module ohne Erklärung bedient. Im Belastungstest ist der Würfel zehnmal aus zwei Metern Höhe gefallen, ohne Schäden an Struktur oder Mechanik.

Der eigentliche Test kam danach: 80 Kindergartenkinder, in vier Wellen. Der Würfel hat durchgehalten. Die Kinder fanden ihn großartig.

Für uns war dieser Tag mindestens so lehrreich wie die Konstruktion, vor allem weil vorher keiner von uns groß mit Kindern zu tun hatte. Ob sie hinterher schlauer waren, keine Ahnung. Unterhalten waren sie auf jeden Fall.

Kein Softwareprojekt, das ich je gebaut habe, wurde so getestet.

## Was so etwas kostet

Material laut BOM: **75,73 €**. Mit acht Stunden Arbeitszeit zum Mindestlohn und 100 % Marge landet der kalkulierte Stückpreis bei **373,86 €**. Die Rechnung war Teil der Abgabe, und sie war lehrreicher als erwartet: Der ESP32 kostet 3 €, der Rest sind Kunststoff, Zeit und Sicherheit.

## Fazit

Der eigentliche Lerneffekt lag nicht beim Mikrocontroller. Er lag darin, dass die härtesten Anforderungen nicht aus der Technik kamen, sondern aus dem Nutzer: jemand, der die Doku nicht lesen kann und das Produkt fallen lässt. Wer dafür baut, entwirft anders.

Code, CAD und Druckdateien liegen offen auf [GitHub](https://github.com/PascalMasny/minti-wuerfel). Die vollständige Projektdokumentation kannst du unten direkt lesen.
