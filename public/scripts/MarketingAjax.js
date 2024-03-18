const MarketingAjax = (function () {
  
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
    async function osvjeziNekretnine(nizNekretnina) {
      try {
        const response = await fetch('http://localhost:3000/marketing/osvjezi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nizNekretnina }),
        });
        const podaciZaOdgovor = await response.json();
        return podaciZaOdgovor;
      } catch (error) {
        console.error('Došlo je do greške prilikom izvođenja neke funkcije:', error);

        throw error;
      }
    }
  
    async function dohvatiDetaljeNekretnine(idNekretnine) {
      try {
        const response = await fetch(`http://localhost:3000/marketing/nekretnina/${idNekretnine}`, {
          method: 'POST',
        });
        const detaljiNekretnine = await response.json();
        return detaljiNekretnine;
      } catch (error) {
        console.error('Došlo je do greške prilikom izvođenja neke funkcije:', error);

        throw error;
      }
    }
  
    return {
      dohvatiNekretnine,
      dodajNekretninu,
      osvjeziNekretnine,
      dohvatiDetaljeNekretnine,
  
    };
  })();

