# Ars Aut Abeat: das Uncanny Valley zum Anfassen

Für unser Semesterprojekt an der THA (Systems Engineering, SoSe 2026) haben wir als Team **PLEB Consulting** eine interaktive Kunstinstallation gebaut: **Ars Aut Abeat**.

## Die Idee

Generative KI füllt das Netz mit Bildern, die man oft als „KI-Slop" abtut. Das wirft eine Frage auf: Was passiert, wenn eine KI immer wieder ihre eigenen Ergebnisse als Vorlage nimmt? Genau dieser Rückkopplungseffekt lässt klassische Kunst Schritt für Schritt ins Unheimliche kippen. Aus dieser Idee ist eine Installation entstanden, die das **Uncanny Valley** erfahrbar und messbar macht.

## Wie es funktioniert

Ein Besucher tritt vor einen antik wirkenden Bilderrahmen und hebt beide Hände als Startgeste. Ein klassisches Gemälde beginnt sich zu verwandeln: Über etwa 30 Sekunden verfremdet eine KI-Rückkopplungsschleife das Werk immer weiter. Gleichzeitig erfasst eine Kamera in Echtzeit sieben Grundemotionen des Betrachters und zeichnet ihren Verlauf auf.

Am Ende steht das Original neben dem verfremdeten Endzustand, dazu ein Diagramm der gemessenen Emotionen und ein kurzes Urteil. Der Besucher wird so selbst zum Teil des Kunstwerks: Der unheimliche Reiz entsteht im Bild, der eigentliche Nachweis in seiner Reaktion.

## Technik

- **Backend:** FastAPI, Echtzeit-Emotionsauswertung, zehn Messungen pro Sekunde über WebSocket
- **Frontend:** Browser, Kamera und Projektion auf eine 200-Zoll-Videowand im Schloss der Hochschule
- **Datenschutz:** keine Videos gespeichert, Analyse läuft lokal, nur anonyme Zahlenwerte
- **Betrieb:** unter 100 Euro Budget, plattformübergreifend auf macOS und Linux

Die komplette Projektdokumentation kannst du unten direkt lesen.
