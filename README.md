# orbiNav


[Reaktor](https://reaktor.com) heitti kuumottavan haasteen [Reaktor Orbital Challenge](https://reaktor.com/orbital-challenge/), jossa annetaan CSV-muotoinen [data](https://space-fast-track.herokuapp.com/generate) maapalloa kiertävistä satelliiteista, sekä lähtö- ja päätepiste maan pinnalla. Näiden perusteella on löydettävä esteetön reitti lähtöpisteestä päätepisteeseen satelliittien kautta. En lannistunut lähes mahdottoman edessä, vaan päätin ratkaista tämänkin ongelman. Lopputuloksena syntyi orbiNav:

[Demo](https://orbinav.herokuapp.com)

## Ohjelman rakenne ja toiminta

Ohjelma on Djangolla (Python) toteutettu nettisivu, jossa palvelin hakee datan Reaktorin palvelimelta, ratkaisee ongelman ja palauttaa ratkaisun JSON-muodossa asiakkaalle (client). 

Palvelin ratkaisee ongelman kaksi kertaa: ensin minimoiden matkan, sitten minimoiden hyppäysten lukumäärän. Kumpikin tapahtuu [Dijkstran algoritmilla](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm), jälkimäisessä graafin sivujen painot ovat kaikki 1.0 todellisen etäisyyden sijaan. Esteettömyys varmistetaan ratkaisemalla säteen ja pallon välinen törmäys vektorimagialla. Business logic tapahtuu tiedostossa `main/views.py`.

Asiakaspäässä ratkaisu näytetään tekstinä, sekä visualisoidaan käyttäen [Three.js](http://threejs.org)-kirjastoa. Leiskan responsiivisuus on toteutettu [Bootstrapillä](http://getbootstrap.com). Lisäksi mukana on [Bootstrap Notify](http://bootstrap-notify.remabledesigns.com) virheilmoitusten antamiseen. Koodi löytyy tiedostosta `main/static/render.js`.

Kaikki koodi on kommentoitua ja varsin selkeää seurattavaa. Nauttikaa virheettömistä lyhyistä reiteistä ympärin maan!