const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const session = require('express-session');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
//let korisnici = require('./data/korisnici.json');
//const nekretnineRawData = fs.readFileSync('./data/nekretnine.json', 'utf8');
//const nekretnine = JSON.parse(nekretnineRawData);

const MarketingAjax = require('./public/scripts/MarketingAjax');

const sequelize = require('./config/sequelize');
const Nekretnina = require('./public/models/nekretnina');
const Upit = require('./public/models/upit');
const Korisnik = require('./public/models/korisnik');

// Primjer za kreiranje hash-a
/*const plainTextPassword = 'NovaSifra'; 

bcrypt.hash(plainTextPassword, 10, function (err, hash) {
  if (err) throw err;
  console.log('Hash šifre:', hash);
});
*/
app.use(cors()); // Omogućavanje CORS za sve rute

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Varijabla za praćenje trenutnog stanja prijave korisnika
let loggedInUser = null;

// Funkcija za provjeru je li korisnik prijavljen
const isUserLoggedIn = () => {
  return loggedInUser !== null;
};

// Funkcija za čitanje korisnika iz datoteke
const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'korisnici.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users from file:', error);
    return [];
  }
};


// Funkcija za provjeru valjanosti korisničkih podataka
const validateUserCredentials = async (username, password) => {
  try {
    const user = await Korisnik.findOne({ where: { username } });

    if (user && bcrypt.compareSync(password, user.password)) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Greška prilikom provjere korisničkih podataka:', error);
    return false;
  }
};

app.get('/prijava.html', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'html', `prijava.html`));
});

app.get('/profil.html', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'html', `profil.html`));
});


app.get('/detalji.html', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'html', `detalji.html`));
});

app.get('/nekretnine.html', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'html', `nekretnine.html`));
});

app.get('/meni.html', (req, res) => {
  // Provjera je li korisnik prijavljen
  if (loggedInUser) {
    res.sendFile(path.join(__dirname, 'public', 'html', 'meniodjava.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'html', 'meniprijava.html'));
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Korisnik.findOne({ where: { username } });

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.username = username;
      loggedInUser = username;
      console.log('Uspješna prijava');
      res.status(200).json({ poruka: 'Uspješna prijava' });
    } else {
      res.status(401).json({ greska: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Greška prilikom prijave:', error);
    res.status(500).json({ greska: 'Greška prilikom prijave' });
  }
});



app.post('/logout', async (req, res) => {
  if (isUserLoggedIn()) {
    loggedInUser = null;
    req.session.username = null;
    res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  } else {
    res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
});

app.get('/korisnik', async (req, res) => {
  if (isUserLoggedIn()) {
    try {
      const trenutniKorisnik = await Korisnik.findOne({ where: { username: loggedInUser } });

      if (!trenutniKorisnik) {
        return res.status(500).json({ greska: 'Neispravno stanje na serveru' });
      }

      const podaciOKorisniku = {
        id: trenutniKorisnik.id,
        ime: trenutniKorisnik.ime,
        prezime: trenutniKorisnik.prezime,
        username: trenutniKorisnik.username,
      };

      res.status(200).json(podaciOKorisniku);
    } catch (error) {
      console.error('Greška prilikom dohvaćanja trenutnog korisnika:', error);
      res.status(500).json({ greska: 'Greška prilikom dohvaćanja trenutnog korisnika' });
    }
  } else {
    res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
});


app.post('/upit', async (req, res) => {
  if (!isUserLoggedIn()) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { nekretnina_id, tekst_upita } = req.body;

  try {
    const trenutniKorisnik = await Korisnik.findOne({ where: { username: loggedInUser } });
    const trazenaNekretnina = await Nekretnina.findByPk(nekretnina_id);

    if (!trenutniKorisnik || !trazenaNekretnina) {
      return res.status(500).json({ greska: 'Neispravno stanje na serveru' });
    }

    const idLogiranogKorisnika = trenutniKorisnik.id;

    // Koristite Sequelize za dodavanje upita
    const noviUpit = await Upit.create({
      korisnik_id: idLogiranogKorisnika,
      tekst_upita,
    });

    // Povežite upit s nekretninom
    await trazenaNekretnina.addUpit(noviUpit);

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Greška prilikom obrade upita:', error);
    res.status(500).json({ greska: 'Greška prilikom obrade upita' });
  }
});


app.put('/korisnik', async (req, res) => {
  // Provjera je li korisnik prijavljen
  if (!isUserLoggedIn()) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Dohvati podatke iz tijela zahtjeva
  const { ime, prezime, username, password } = req.body;

  try {
    // Pronađi trenutnog prijavljenog korisnika u bazi
    const trenutniKorisnik = await Korisnik.findOne({ where: { username: loggedInUser } });

    // Ako korisnik nije pronađen, vratimo odgovor s greškom
    if (!trenutniKorisnik) {
      return res.status(500).json({ greska: 'Neispravno stanje na serveru' });
    }

    // Ažurirajte podatke korisnika s novim informacijama iz tijela zahtjeva
    if (ime) trenutniKorisnik.ime = ime;
    if (prezime) trenutniKorisnik.prezime = prezime;
    if (username) trenutniKorisnik.username = username;
    if (password) trenutniKorisnik.password = password;

    // Spremi promjene u bazi (asinhrono)
    await trenutniKorisnik.save();

    // Ako nema greške pri spremanju, vrati poruku o uspjehu
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Greška prilikom ažuriranja korisnika:', error);
    res.status(500).json({ greska: 'Greška prilikom ažuriranja podataka' });
  }
});


app.get('/nekretnine', async (req, res) => {
  try {
    const sveNekretnine = await Nekretnina.findAll();
    res.status(200).json(sveNekretnine);
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o nekretninama iz baze:', error);
    res.status(500).json({ greska: 'Greška prilikom dohvaćanja podataka o nekretninama' });
  }
});

// Ruta za dodavanje nove nekretnine
app.post('/nekretnine', async (req, res) => {
  const novaNekretnina = req.body;

  try {
    // Unos podataka u bazu
    const kreiranaNekretnina = await Nekretnina.create(novaNekretnina);
    res.status(200).json({ poruka: 'Nekretnina uspješno dodana', id: kreiranaNekretnina.id });
  } catch (error) {
    console.error('Greška prilikom dodavanja nove nekretnine:', error);
    res.status(500).json({ greska: 'Greška prilikom dodavanja nove nekretnine' });
  }
});


// Prazan niz koji simulira podatke o nekretninama
let nekretninePodaci = [
  { id: 1, klikovi: 50, pretrage: 10 },
  { id: 5, klikovi: 20, pretrage: 5 },
  { id: 6, klikovi: 30, pretrage: 8 },
  { id: 7, klikovi: 15, pretrage: 3 },
  { id: 12, klikovi: 40, pretrage: 7 }
];

// Ruta: /marketing/nekretnine
app.post('/marketing/nekretnine', (req, res) => {
  const nizNekretnina = req.body.nizNekretnina;

  // Simulacija ažuriranja podataka na serveru
  console.log('Primljeni niz nekretnina:', nizNekretnina);

  res.status(200).send();
});

// Ruta: /marketing/nekretnina/:id
app.post('/marketing/nekretnina/:id', (req, res) => {
  const idNekretnine = req.params.id;

  // Simulacija ažuriranja podataka na serveru
  console.log('Primljeni ID nekretnine:', idNekretnine);

  res.status(200).send();
});

app.post('/marketing/osvjezi', (req, res) => {
  const nizNekretnina = req.body.nizNekretnina;

  if (Array.isArray(nizNekretnina) && nizNekretnina.length > 0) {
    const podaciZaOdgovor = nekretninePodaci.filter(nekretnina => nizNekretnina.includes(nekretnina.id));

    res.status(200).json({
      nizNekretnina: podaciZaOdgovor
    });
  } else {
    res.status(400).send('Nevažeći nizNekretnina u zahtjevu.');
  }
});


// Povezivanje modela i definiranje relacija
Korisnik.hasMany(Upit);
Upit.belongsTo(Korisnik);

Nekretnina.hasMany(Upit);
Upit.belongsTo(Nekretnina);

// Dodaj funkciju za čišćenje baze i tablica prije punjenja
const clearDatabase = async () => {
  try {
    // Obriši sve redove iz tablica
    await Nekretnina.destroy({ where: {} });
    await Upit.destroy({ where: {} });
    await Korisnik.destroy({ where: {} });

    console.log('Baza i tablice su očišćene.');
  } catch (error) {
    console.error('Greška prilikom čišćenja baze i tablica:', error);
  }
};

// Pozovite funkciju za čišćenje baze pri pokretanju aplikacije
clearDatabase();


// Izvršite migracije
sequelize.sync({ alert: true }).then(async () => {
  console.log('Struktura tablica je ažurirana prema modelima.');

  // Dodavanje početnih podataka u bazu
  try {
    await Nekretnina.bulkCreate([
      {
        tip_nekretnine: "Stan",
        naziv: "Penthouse Sarajevo Tower",
        kvadratura: 118.17,
        cijena: 340000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/55874570/lg/img-1697710096-b32780d45a1e.JPG",
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus."
      },
      {
        tip_nekretnine: "Stan",
        naziv: "Stan Bosmal Hrasno",
        kvadratura: 58,
        cijena: 232000,
        slika: "https://s9.pik.ba/galerija/2022-03/25/11/slika-3158352-623d931a846d7-velika.jpg",
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus."
      }, {

        tip_nekretnine: "Stan",
        naziv: "Dvoiposoban Stan Sarajevo - Alipašino polje C faza",
        kvadratura: 65,
        cijena: 300000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/55190497/lg/img-1695466412-b035f72aa587.jpeg",
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus."
      },
      {
        tip_nekretnine: "Kuca",
        naziv: "Kuća Osenik Hadžići",
        kvadratura: 146,
        cijena: 275000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/54029238/lg/img-1688291984-758d7bf610af.jpg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {
        tip_nekretnine: "Kuca",
        naziv: "Kuća/VILA Ilidža-Blazuj",
        kvadratura: 400,
        cijena: 550000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/56290950/lg/img-1698944468-be44cd079081.JPG",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {
        tip_nekretnine: "Kuca",
        naziv: "Kuća Vogošća Hotonj",
        kvadratura: 330,
        cijena: 179500,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/54745831/lg/img-1691916076-0dfd0987af19.jpg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      }
      , {
        tip_nekretnine: "Poslovni prostor",
        naziv: "Sarajevo Centar",
        kvadratura: 90,
        cijena: 3600,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/56248097/lg/img-1698752331-f2f6cc53e847.jpeg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      }, {
        tip_nekretnine: "Poslovni prostor",
        naziv: "Novogradnja - Centar - Šip",
        kvadratura: 43,
        cijena: 174520,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/56323106/lg/img-1699097942-86cb7c69b908.jpg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {
        tip_nekretnine: "Poslovni prostor",
        naziv: "Stup Ilidža",
        kvadratura: 30,
        cijena: 99000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/54802370/lg/img-1695277395-bdb2b6b382cf.jpg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {
        tip_nekretnine: "Stan",
        naziv: "Stan Moja Malta - Opremljen - Dolac Malta",
        kvadratura: 65,
        cijena: 355.000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/55685283/lg/img-1697199298-eff18cb4abad.jpeg ",
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus."
      },
      {

        tip_nekretnine: "Stan",
        naziv: "Stan Sarajevo - Novo Sarajevo - Grbavica",
        kvadratura: 70,
        cijena: 285.000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/52886447/lg/img-1681912189-c9a14ef36a6d.jpg ",
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus."
      },
      {
        tip_nekretnine: "Stan",
        naziv: "MY SPACE/ Stan/ Ilidza Residence/ NOVOGRADNJA",
        kvadratura: 45.47,
        cijena: 162.259,
        slika: "https://www.realitica.com/images/listing_photos/2973140_567120a9-3012-4c5f-9e60-6e481b65a2ca.jpeg",
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus."
      },
      {
        tip_nekretnine: "Kuca",
        naziv: "Kuća Sarajevo Novi Grad",
        kvadratura: 120,
        cijena: 164.900,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/53796344/lg/img-1686830994-4d8e87e442b7.JPG",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {
        tip_nekretnine: "Kuca",
        naziv: "Kuća Koševsko Brdo Centar",
        kvadratura: 170,
        cijena: 320.000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/56300157/lg/img-1698995814-43999f3675ea.jpg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {

        tip_nekretnine: "Kuca",
        naziv: "Kuća, Sokolović Kolonija-Ilidža",
        kvadratura: 140,
        cijena: 285000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/48243249/lg/tPnH3HgjjGxdSf7Wyf8y.jpg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {

        tip_nekretnine: "Poslovni prostor",
        naziv: "BAULAND/ Poslovni prostor u samom centru Ilidže",
        kvadratura: 100,
        cijena: 370000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/53783090/lg/img-1686748558-abb208469665.JPG",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {
        tip_nekretnine: "Poslovni prostor",
        naziv: "Poslovni prostor Sarajevo - Centar",
        kvadratura: 24,
        cijena: 72000,
        slika: "https://d4n0y8dshd77z.cloudfront.net/listings/55299406/lg/img-1695400861-78b050d78861.jpg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      },
      {
        tip_nekretnine: "Poslovni prostor",
        naziv: "Poslovni prostori/ Otoka/ NOVOGRADNJA",
        kvadratura: 38,
        cijena: 56000,
        slika: "https://s9.pik.ba/galerija/2021-11/22/03/slika-1070163-619baf3308021-velika.jpg",
        tip_grijanja: "centralno",
        lokacija: "Sarajevo",
        godina_izgradnje: 2000,
        datum_objave: "01.11.2023.",
        opis: "Opis kuće."
      }

    ]);

    await Korisnik.bulkCreate([
      {
        ime: "NovoIme",
        prezime: "NovoPrezime",
        username: "NoviUsername",
        password: "$2b$10$lVXRT8M7GyKNiGDEoW8.JuHbjbnUGqfLpliOQv8ZzYInYH33KIgg6"
      },
      {
        ime: "Neko2",
        prezime: "Nekic2",
        username: "username2",
        password: "hashPassworda2"
      }

    ]);

    await Upit.bulkCreate([
      {

        korisnik_id: 1,
        tekst_upita: "Interesuje me dostupnost stana koji sam primjetio na vašem oglasu. Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
       
      },
      {
        korisnik_id: 2,
        tekst_upita: "Molim vas, možete li mi reći više o stanu koji je dostupan za najam? Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
       
      },
      {
        korisnik_id: 3,
        tekst_upita: "Interesuje me dostupnost stana koji sam primjetio na vašem oglasu. Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
       
      },
      {
        korisnik_id: 4,
        tekst_upita: "Molim vas, možete li mi reći više o stanu koji je dostupan za najam? Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
      },
      {
        korisnik_id: 5,
        tekst_upita: "Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
      },
      {
        korisnik_id: 6,
        tekst_upita: "Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
      },
      {
        korisnik_id: 7,
        tekst_upita: "Da li je bučno u stanu jer mu je lokacija poprilično blizu ceste?"
      },
      {
        korisnik_id: 8,
        tekst_upita: "Da li je cijena fiksna ili se može pregovarati?"
      },
      {
        korisnik_id: 9,
        tekst_upita: "Interesuje me dostupnost stana koji sam primjetio na vašem oglasu. Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
      },
      {
        korisnik_id: 10,
        tekst_upita: "Molim vas, možete li mi reći više o stanu koji je dostupan za najam? Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
      },
      {
        korisnik_id: 11,
        tekst_upita: "Interesuje me dostupnost stana koji sam primjetio na vašem oglasu. Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
      },
      {
        korisnik_id: 12,
        tekst_upita: "Molim vas, možete li mi reći više o stanu koji je dostupan za najam? Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
      },
      {
        korisnik_id: 13,
        tekst_upita: "Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
      },
      {
        korisnik_id: 14,
        tekst_upita: "Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
      },
      {
        korisnik_id: 15,
        tekst_upita: "Da li je bučno u stanu jer mu je lokacija poprilično blizu ceste?"
      },
      {
        korisnik_id: 16,
        tekst_upita: "Da li je cijena fiksna ili se može pregovarati?"
      },
      {
        korisnik_id: 17,
        tekst_upita: "Interesuje me dostupnost stana koji sam primjetio na vašem oglasu. Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
      },
      {
        korisnik_id: 18,
        tekst_upita: "Molim vas, možete li mi reći više o stanu koji je dostupan za najam? Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
      },
      {
        korisnik_id: 19,
        tekst_upita: "Interesuje me dostupnost stana koji sam primjetio na vašem oglasu. Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
      },
      {
        korisnik_id: 20,
        tekst_upita: "Molim vas, možete li mi reći više o stanu koji je dostupan za najam? Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
      },
      {
        korisnik_id: 21,
        tekst_upita: "Da li biste mogli da mi pružite informacije o lokaciji, površini stana, i da li su troškovi komunalija uključeni u cijenu najma?"
      },
      {
        korisnik_id: 22,
        tekst_upita: "Kolika je mesečna kirija, koliko soba ima i da li su kućni ljubimci dozvoljeni?"
      },
      {
        korisnik_id: 23,
        tekst_upita: "Da li je bučno u stanu jer mu je lokacija poprilično blizu ceste?"
      },
      {
        korisnik_id: 24,
        tekst_upita: "Da li je cijena fiksna ili se može pregovarati?"
      }

    ]);

    console.log('Podaci o nekretninama su dodani u bazu.');
  } catch (error) {
    console.error('Greška prilikom dodavanja podataka o nekretninama:', error);
  }
});

// Ruta: /nekretnina/:id
app.get('/nekretnina/:id', async (req, res) => {
  const nekretninaId = req.params.id;

  try {
    // Pronađi nekretninu prema ID-u
    const trazenaNekretnina = await Nekretnina.findByPk(nekretninaId);

    // Ako nekretnina ne postoji, vrati odgovarajući JSON
    if (!trazenaNekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretninaId} ne postoji` });
    }

    // Ako nekretnina postoji, vrati podatke o nekretnini
    res.status(200).json(trazenaNekretnina);
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o nekretnini:', error);
    res.status(500).json({ greska: 'Greška prilikom dohvaćanja podataka o nekretnini' });
  }
});


app.listen(port, () => {
  console.log(`Server pokrenut na http://localhost:${port}`);
});

