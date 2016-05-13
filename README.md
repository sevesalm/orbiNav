# orbiNav


[Reaktor](https://reaktor.com) heitti kuumottavan haasteen [Reaktor Orbital Challenge](https://reaktor.com/orbital-challenge/), jossa annetaan CSV-muotoinen [data](https://space-fast-track.herokuapp.com/generate) maapalloa kiertävistä satelliiteista, sekä lähtö- ja päätepiste maan pinnalla. Näiden perusteella on löydettävä esteetön reitti lähtöpisteestä päätepisteeseen satelliittien kautta. En lannistunut lähes mahdottoman edessä, vaan päätin ratkaista tämänkin ongelman. Lopputuloksena syntyi orbiNav:

[Demo](https://orbinav.herokuapp.com)

## Ohjelman rakenne ja toiminta

Ohjelma on Djangolla (Python) toteutettu nettisivu, jossa palvelin hakee datan Reaktorin palvelimelta, ratkaisee ongelman ja palauttaa ratkaisun JSON-muodossa asiakkaalle (client). 

Palvelin ratkaisee ongelman kaksi kertaa: ensin minimoiden matkan, sitten minimoiden hyppäysten lukumäärän - ratkaisut eivät ole aina identtiset. Kumpikin tapahtuu [Dijkstran algoritmilla](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm), jälkimäisessä graafin sivujen painot ovat kaikki 1.0 todellisen etäisyyden sijaan. Esteettömyys varmistetaan ratkaisemalla säteen ja pallon välinen törmäys vektorimagialla. Business logic tapahtuu tiedostossa `main/views.py`.

Asiakaspäässä ratkaisu näytetään tekstinä, sekä visualisoidaan käyttäen [Three.js](http://threejs.org)-kirjastoa. Leiskan responsiivisuus on toteutettu [Bootstrapillä](http://getbootstrap.com). Lisäksi mukana on [Bootstrap Notify](http://bootstrap-notify.remabledesigns.com) virheilmoitusten antamiseen. Koodi löytyy tiedostosta `main/static/render.js`.

Kaikki koodi on kommentoitua ja varsin selkeää seurattavaa. Kaikki palaute on tervetullutta!

## The same in English

This is my humble proposal as a solution to a problem [Reaktor Orbital Challenge](https://reaktor.com/orbital-challenge/). Basically server side solves the problem using [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm). It calculates both the route with least amount of hops and the route with the shortest total length - the solutions might differ. Basic Ray-Sphere intersection calculations are used to determine line-of-sight. The result is passed to the client in JSON after the client has made an AJAX request. 

3D visualization is done with [Three.js](http://threejs.org) library. [Bootstrap](http://getbootstrap.com) was used to create responsive layout and webpage styling.

Feel free to ask more and give feedback and ideas to improve the application!