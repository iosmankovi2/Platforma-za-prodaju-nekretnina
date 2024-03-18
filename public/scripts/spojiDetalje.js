import { impl_postUpit } from "/scripts/PoziviAjax.js";

$(document).ready(function () {
    // event listener za klik na dugme "Detalji"
    $('.detalji-button').on('click', function () {
        //  nekretnina_id iz atributa data-id na dugmetu
        const nekretnina_id = $(this).data('id');

        // Poziv funkcije za dohvaćanje detalja
        dohvatiDetaljeNekretnine(nekretnina_id);
    });
});

// Funkcija za dohvaćanje detalja nekretnine
function dohvatiDetaljeNekretnine(nekretnina_id) {
    PoziviAjax.getNekretninaById(nekretnina_id, function (error, data) {
        if (error) {
            console.error('Greška pri preuzimanju detalja o svojstvu:', error);
        } else {
            console.log('Detalji nekretnine:', data);

           // Ažurirajte HTML elemente s detaljima nekretnine
            $('#naziv').text(data.naziv);
            $('#kvadratura').text(`Kvadratura: ${data.kvadratura} m²`);
            $('#cijena').text(`Cijena: ${data.cijena} KM`);
            $('#lokacija').text(`Lokacija: ${data.lokacija}`);
            $('#godinaIzgradnje').text(`Godina izgradnje: ${data.godina_izgradnje}`);

            // Otvorite stranicu detalji.html
            window.location.href = 'detalji.html';
        }
    });
}

$(document).ready(function () {
    // Provera korisničkog statusa pre prikaza dugmeta i polja za unos upita
    if (isUserLoggedIn()) {
        $('#upit-container').show();
    } else {
        $('#upit-container').hide();
    }

    // event listener za klik na dugme "Postavi upit"
    $('#postaviUpitBtn').on('click', function () {
        if (isUserLoggedIn()) {
            // Dohvati tekst upita iz input polja
            const tekst_upita = $('#upitTekst').val();

            // Dohvati nekretnina_id iz URL-a
            const nekretnina_id = getParameterByName('nekretnina_id');

            // Poziv funkcije za postavljanje upita
            impl_postUpit(nekretnina_id, tekst_upita, function (error, data) {
                if (error) {
                    console.error('Greška pri postavljanju upita:', error);
                } else {
                    console.log('Upit uspješno postavljen:', data);
                    // Ažurirajte HTML ili izvršite druge akcije prema potrebi
                }
            });
        } else {
            console.log('Korisnik nije prijavljen. Prikazati poruku ili preusmeriti na stranicu za prijavu.');
        }
    });
});

// Funkcija za dobijanje parametara iz URL-a
function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
''
