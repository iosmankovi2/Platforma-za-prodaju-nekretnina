// Funkcija za dohvaćanje nekretnina
async function dohvatiNekretnine() {
    try {
        const response = await fetch('http://localhost:3000/nekretnine');
        const nekretnine = await response.json();
        return nekretnine;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
// Funkcija za dodavanje nove nekretnine
async function dodajNekretninu(novaNekretnina) {
    try {
        const response = await fetch('http://localhost:3000/nekretnine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novaNekretnina),
        });
        const responseData = await response.json();
        console.log(responseData);
        // Osvježavanje prikaza nekretnina nakon dodavanja
        const nekretnine = await dohvatiNekretnine();
        return nekretnine;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Instanciranje modula
let nekretnineModul = new SpisakNekretnina();

// Inicijalizacija podataka
(async () => {
    try {
        const listaNekretnina = await dohvatiNekretnine();
        nekretnineModul.init(listaNekretnina, []);

        // Pozivanje funkcije za svaki tip nekretnine
        iscrtajNekretnine(document.getElementById("stan"), nekretnineModul, "Stan");
        iscrtajNekretnine(document.getElementById("kuca"), nekretnineModul, "Kuca");
        iscrtajNekretnine(document.getElementById("poslovniprostor"), nekretnineModul, "Poslovni prostor");
    } catch (error) {
        console.error(error);
    }
})();

// Funkcija za spoj nekretnina na stranicu
function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine, filtriraneNekretnine) {
    console.log(`Pozvana funkcija spojiNekretnine za ${tip_nekretnine}`);

    // Očisti postojeći prikaz nekretnina na stranici
    divReferenca.innerHTML = "";

    // Prikazivanje elemenata u divReferenca element
    const div = document.createElement("div");
    div.className = "pravougaonik";

    if (filtriraneNekretnine) {
        filtriraneNekretnine.forEach(nekretnina => {
            if (nekretnina.tip_nekretnine === tip_nekretnine) {
                const nekretninaElement = document.createElement("div");
                const klasaNekretnine = tip_nekretnine.toLowerCase().replace(/\s+/g, ''); // Zamjena razmaka donjom crtom
                nekretninaElement.classList.add(klasaNekretnine);

                nekretninaElement.innerHTML = `
                <img src="${nekretnina.slika}" alt="${nekretnina.naziv}">
                <h3>${nekretnina.naziv}</h3>
                <div id="osnovneDetalji-${nekretnina.id}">
                <button onclick="prikaziDetalje(${nekretnina.id})">Detalji</button>

                </div>
                <div id="detalji-${nekretnina.id}" class="detalji" style="display: none;">
                    <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                    <p class="cijena">Cijena: ${nekretnina.cijena} KM</p>
                    <p>Lokacija: ${nekretnina.lokacija}</p>
                    <p>Godina izgradnje: ${nekretnina.godina_izgradnje}</p>
                    <button onclick="otvoriDetalje(${nekretnina.id})">Otvori detalje</button>
                </div>
            `;
                div.appendChild(nekretninaElement);
            }
        });
    } else {
        // Ako nema filtracije, prikaži sve nekretnine
        const sveNekretnine = instancaModula.filtrirajNekretnine();
        sveNekretnine.forEach(nekretnina => {
            if (nekretnina.tip_nekretnine === tip_nekretnine) {
                const nekretninaElement = document.createElement("div");
                const klasaNekretnine = tip_nekretnine.toLowerCase().replace(/\s+/g, ''); // Zamjena razmaka donjom crtom
                nekretninaElement.classList.add(klasaNekretnine);
                nekretninaElement.innerHTML = `
                <img src="${nekretnina.slika}" alt="${nekretnina.naziv}">
                <h3>${nekretnina.naziv}</h3>
                <div id="osnovneDetalji-${nekretnina.id}">
                <button onclick="prikaziDetalje(${nekretnina.id})">Detalji</button>

                </div>
                <div id="detalji-${nekretnina.id}" class="detalji" style="display: none;">
                    <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                    <p class="cijena">Cijena: ${nekretnina.cijena} KM</p>
                    <p>Lokacija: ${nekretnina.lokacija}</p>
                    <p>Godina izgradnje: ${nekretnina.godina_izgradnje}</p>
                    <button onclick="otvoriDetalje(${nekretnina.id})">Otvori detalje</button>
                </div>
            `;
                div.appendChild(nekretninaElement);
            }
        });
    }

    divReferenca.appendChild(div);
    console.log(`Elementi dodani za ${tip_nekretnine}`);
}

// Funkcija za prikazivanje detalja
window.prikaziDetalje = async function (idNekretnine) {
    try {
        // Dobijanje podataka o nekretnini
        const nekretnina = await dohvatiNekretninu(idNekretnine);

        // Prikazivanje dodatnih detalja
        document.getElementById(`osnovneDetalji-${idNekretnine}`).style.display = 'none';
        const detaljiElement = document.getElementById(`detalji-${idNekretnine}`);
        detaljiElement.style.display = 'block';

        // Popunjavanje dodatnih detalja
        detaljiElement.innerHTML = `
            <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
            <p class="cijena">Cijena: ${nekretnina.cijena} KM</p>
            <p>Lokacija: ${nekretnina.lokacija}</p>
            <p>Godina izgradnje: ${nekretnina.godina_izgradnje}</p>
            <button onclick="otvoriDetalje(${idNekretnine})">Otvori detalje</button>
        `;
    } catch (error) {
        console.error("Greška pri prikazu detalja:", error);
    }
}


// Funkcija za otvaranje detalja na stranici detalji.html
window.otvoriDetalje = async function (idNekretnine) {
    try {
        // Dobijanje podataka o nekretnini
        const nekretnina = await dohvatiNekretninu(idNekretnine);

        // Prijenos podataka na detalji.html
        window.localStorage.setItem('detaljiPodaci', JSON.stringify(nekretnina));

        // Otvori stranicu detalji.html
        window.location.href = 'detalji.html';
    } catch (error) {
        console.error("Greška pri otvaranju detalja:", error);
    }
}


// Detalji
document.addEventListener('DOMContentLoaded', function () {
    initDetaljiStranice();
});

function initDetaljiStranice() {
    // Dobijanje podataka iz lokalnog skladišta
    const detaljiPodaci = JSON.parse(window.localStorage.getItem('detaljiPodaci'));

    // Provjera da li postoje podaci
    if (detaljiPodaci) {
        // Postavljanje podataka na stranicu detalji.html


        //Osnovno
        const osnovnoElement = document.getElementById('osnovno');
        osnovnoElement.innerHTML = `
    <h3>OSNOVNO</h3>
    <p>
    <img src = "${detaljiPodaci.slika}">
    </p>
    <p><strong> Naziv: </strong> ${detaljiPodaci.naziv} </p>
    <br>
    <p><strong>Kvadratura:</strong> ${detaljiPodaci.kvadratura} </p>
    <br>
    <p><strong>Cijena:</strong> ${detaljiPodaci.cijena}</p>
    `;

        // Detalji
        const detaljiElement = document.getElementById('detalji');
        detaljiElement.innerHTML = `
            <h3>DETALJI</h3>
            <table>
                <tr class="red">
                    <td class="kolona"><strong>Tip grijanja:</strong> ${detaljiPodaci.tip_grijanja}</td>
                    <td class="kolona"><strong>Godina izgradnje:</strong> ${detaljiPodaci.godina_izgradnje}</td>
                </tr>
                <tr class="red">
                    <td class="kolona"><strong>Lokacija:</strong> ${detaljiPodaci.lokacija}</td>
                    <td class="kolona"><strong>Datum objave:</strong> ${detaljiPodaci.datum_objave}</td>
                </tr>
                <tr class="red">
                    <td class="kolona" colspan="2">
                        <strong>Opis: </strong> ${detaljiPodaci.opis}
                    </td>
                </tr>
            </table>
        `;

        // Upiti
        const upitiElement = document.getElementById('upiti');
        upitiElement.innerHTML = `
        <h3>UPITI</h3>
        <ul class="lista-upita">
                <li>
                    <span class="korisnik">${detaljiPodaci.korisnik_id}</span>
                    <br><br>
                    <span class="upit">${detaljiPodaci.tekst_upita}</span>
                </li>
        </ul>
    `
    }
}

  
  // Pozovi funkciju za prikaz upita kada se stranica učita
  document.addEventListener('DOMContentLoaded', prikaziUpite);

async function dohvatiNekretninu(idNekretnine) {
    try {
        const response = await fetch(`http://localhost:3000/nekretnina/${idNekretnine}`);

        // Provjera status koda
        if (response.status === 404) {
            throw new Error(`Nekretnina sa ID ${idNekretnine} nije pronađena.`);
        }

        // Provjera da li je odgovor HTML
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Odgovor nije validan JSON");
        }

        const nekretnina = await response.json();
        return nekretnina;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Primjer korištenja
const stan = document.getElementById("stan");
const kuca = document.getElementById("kuca");
const poslovniprostor = document.getElementById("poslovniprostor");
let listaIdNekretnina;
async function filtrirajNekretnine() {
    // Dobijanje vrijednosti iz polja za pretragu
    const minCijena = parseFloat(document.getElementById("minCijena").value) || 0;
    const maxCijena = parseFloat(document.getElementById("maxCijena").value) || Infinity;
    const minKvadratura = parseFloat(document.getElementById("minKvadratura").value) || 0;
    const maxKvadratura = parseFloat(document.getElementById("maxKvadratura").value) || Infinity;

    // Filtriranje nekretnina s odgovarajućim kriterijumima
    const filtriraneNekretnine = nekretnineModul.filtrirajNekretnine({
        min_cijena: minCijena,
        max_cijena: maxCijena,
        min_kvadratura: minKvadratura,
        max_kvadratura: maxKvadratura

    });

    // Očisti postojeći prikaz nekretnina na stranici
    const stanDiv = document.getElementById("stan");
    const kucaDiv = document.getElementById("kuca");
    const poslovniprostorDiv = document.getElementById("poslovniprostor");

    stanDiv.innerHTML = "";

    kucaDiv.innerHTML = "";
    poslovniprostorDiv.innerHTML = "";

    // Ažuriraj prikaz sa filtriranim nekretninama
    spojiNekretnine(stanDiv, nekretnineModul, "Stan", filtriraneNekretnine);
    spojiNekretnine(kucaDiv, nekretnineModul, "Kuca", filtriraneNekretnine);
    spojiNekretnine(poslovniprostorDiv, nekretnineModul, "Poslovni prostor", filtriraneNekretnine);

    try {
        const response = await fetch('http://localhost:3000/marketing/nekretnine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nizNekretnina: listaIdNekretnina }),
        });
        const responseData = await response.json();
        console.log(responseData);


    } catch (error) {
        console.error(error);
    }

    // Prikazati ažurirane nekretnine u konzoli
    console.log("Filtrirane nekretnine:", filtriraneNekretnine);
}

// Funkcija za iscrtavanje nekretnina s dodatnim div elementima za pretrage i klikove
function iscrtajNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    console.log(`Pozvana funkcija iscrtajNekretnine za ${tip_nekretnine}`);
    // Pozivanje metode za filtriranje
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });

    // Iscrtavanje elemenata u divReferenca element
    const div = document.createElement("div");
    div.className = "pravougaonik";

    filtriraneNekretnine.forEach(nekretnina => {

        const nekretninaElement = document.createElement("div");
        const klasaNekretnine = tip_nekretnine.toLowerCase().replace(/\s+/g, ''); // Zamjena razmaka donjom crtom
        nekretninaElement.classList.add(klasaNekretnine);

        // dodatni div-ove za pretrage i klikove
        const divPretrage = document.createElement("div");
        divPretrage.id = `pretrage-${nekretnina.id}`;
        const divKlikovi = document.createElement("div");
        divKlikovi.id = `klikovi-${nekretnina.id}`;

        nekretninaElement.innerHTML = `
        <img src="${nekretnina.slika}" alt="${nekretnina.naziv}">
                <h3>${nekretnina.naziv}</h3>
                <div id="osnovneDetalji-${nekretnina.id}">
                <button onclick="prikaziDetalje(${nekretnina.id})">Detalji</button>

                </div>
                <div id="detalji-${nekretnina.id}" class="detalji" style="display: none;">
                    <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                    <p class="cijena">Cijena: ${nekretnina.cijena} KM</p>
                    <p>Lokacija: ${nekretnina.lokacija}</p>
                    <p>Godina izgradnje: ${nekretnina.godina_izgradnje}</p>
                    <button onclick="otvoriDetalje(${nekretnina.id})">Otvori detalje</button>
                </div>
    `;
        nekretninaElement.appendChild(divPretrage);
        nekretninaElement.appendChild(divKlikovi);

        div.appendChild(nekretninaElement);

    });

    divReferenca.innerHTML = "";
    divReferenca.appendChild(div);

    console.log(`Elementi dodani za ${tip_nekretnine}`);
} 
