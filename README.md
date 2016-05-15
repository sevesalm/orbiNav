# orbiNav

This is my solution to [Reaktor Orbital Challenge](https://reaktor.com/orbital-challenge/). Basically a CSV formatted [data file](https://space-fast-track.herokuapp.com/generate) is given. It contains coordinates and altitudes of satellites orbiting the Earth. There are also starting and end points. One must find an unobstructed way from the start to the end using the satellites. Is this an impossible mission? Not at all! Here is a working solution:

[Demo](https://orbinav.herokuapp.com) (Heroku - might have some initial delay...)

## Implementation details

orbiNav is a web application for fetching, solving and presenting the problem and the solution. Server uses Django framework (Python) and client side is written in JavaScript. After the client has made a new AJAX request server side first fetches a new problem from Reaktor server. It then solves the problem using [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm). It calculates both the route with the shortest total length and the route with least amount of hops  - the solutions sometimes differ. Basic Ray-Sphere intersection calculations are used to determine line-of-sight. The result including visualization data is then passed to the client in JSON.

The client shows the solution both as text and as a 3D model. 3D visualization is done using [Three.js](http://threejs.org). There is a fallback method if the browser doesn't support WebGL. [Bootstrap](http://getbootstrap.com) was used to create responsive layout and webpage styling.

The code is commented and quite easy to follow. The solving business logic can be found in `main/solver.py` and the client side implementation in `main/static/render.js`. orbiNav has also been tested with a few Android phones. 

Feel free to ask more or give feedback and ideas to improve the application!
