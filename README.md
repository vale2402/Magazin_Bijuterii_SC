# 👑 Magazin de Bijuterii S&C

Acest repository conține codul sursă pentru un magazin online de bijuterii (S&C), dezvoltat în cadrul cursului de Tehnici Web (Etapele 1 și 2). 

Proiectul pune accent pe un design modern, o structură semantică a paginii și utilizarea tehnicilor avansate de CSS pentru a oferi o experiență de navigare fluidă și responsive.

## 📄 Documentația Proiectului
Toate deciziile de design, detaliile despre schema cromatică, wireframe-urile și progresul etapelor pot fi consultate în documentul oficial:
👉 **[Documentație Proiect S&C (Google Docs)](https://docs.google.com/document/d/1VOmAgbN8NFGB52BT099QL6RK2ITKbZ7RX4iN8Dl1HgQ/edit?usp=sharing)**

## ✨ Funcționalități implementate (Etapele 1 & 2)

* **Layout Responsive:** Structură complet adaptabilă pe ecrane mari, medii și mici, realizată cu ajutorul `CSS Grid` (pentru layout-ul principal) și `Flexbox`.
* **Design Rudimentar & UI:** * Schemă cromatică elegantă pe bază de mov și nuanțe de bej/crem (Tyrian purple), aplicată prin **variabile CSS** globale.
  * Izolare vizuală prin bordere, box-shadow și border-radius.
  * Redimensionare fluidă a textului și a elementelor media pe rezoluții diferite.
* **Reset CSS Personalizat:** Transformarea dimensiunilor în unități relative (`rem`/`em`), resetarea stilurilor implicite de liste și tabele pentru un control perfect al designului.
* **Componente Speciale Stilizate:**
  * **Tabel dinamic:** Cu margini alternate și efect de highlight pe rânduri la `:hover`.
  * **Iframe Taburi:** Sistem vizual de "dosare/tab-uri" folosind `<a target="...">` pentru navigarea facilă între videoclipuri.
  * **Buton "Înapoi sus" animat:** Design custom cu border gradient rotativ.
* **Tipografie și Iconografie:** Folosire font extern (Google Fonts - Roboto Condensed) și iconițe statice/animate (FontAwesome).

## 🛠️ Tehnologii folosite
* HTML5 (Elemente semantice, MathML)
* CSS3 (Grid, Flexbox, Variabile, Tranziții, Pseudo-elemente)