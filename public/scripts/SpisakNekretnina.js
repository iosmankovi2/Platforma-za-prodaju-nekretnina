let SpisakNekretnina = function () {
  // Privatni atributi modula
  let listaNekretnina = [];
  let listaKorisnika = [];

  
  // Implementacija metoda
  let init = function (novaListaNekretnina, novaListaKorisnika) {
    listaNekretnina = novaListaNekretnina;
    listaKorisnika = novaListaKorisnika;
  };

  let filtrirajNekretnine = function (kriterij) {
    return listaNekretnina.filter(nekretnina => {
      if (!kriterij || Object.keys(kriterij).length === 0) {
        return true; // Ako nema kriterija, vraćamo sve nekretnine
      }

      let zadovoljavaKriterije = true;

      // Filtriranje po tipu nekretnine
      if (kriterij.tip_nekretnine && nekretnina.tip_nekretnine !== kriterij.tip_nekretnine) {
        zadovoljavaKriterije = false;
      }

      // Filtriranje po minimalnoj kvadraturi
      if (kriterij.min_kvadratura && nekretnina.kvadratura < kriterij.min_kvadratura) {
        zadovoljavaKriterije = false;
      }

      // Filtriranje po maksimalnoj kvadraturi
      if (kriterij.max_kvadratura && nekretnina.kvadratura > kriterij.max_kvadratura) {
        zadovoljavaKriterije = false;
      }

      // Filtriranje po minimalnoj cijeni
      if (kriterij.min_cijena && nekretnina.cijena < kriterij.min_cijena) {
        zadovoljavaKriterije = false;
      }

      // Filtriranje po maksimalnoj cijeni
      if (kriterij.max_cijena && nekretnina.cijena > kriterij.max_cijena) {
        zadovoljavaKriterije = false;
      }

      return zadovoljavaKriterije;
    });
  };

  let ucitajDetaljeNekretnine = function (id) {
    return listaNekretnina.find(nekretnina => nekretnina.id === id) || null;
  };

 

  return {
    init: init,
    filtrirajNekretnine: filtrirajNekretnine,
    ucitajDetaljeNekretnine: ucitajDetaljeNekretnine
  };


};


