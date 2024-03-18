const PoziviAjax = (() => {

    function impl_getKorisnik(fnCallback) {
        $.ajax({
            url: '/korisnik',
            method: 'GET',
            success: function (data) {
                fnCallback(null, data);
            },
            error: function (error) {
                fnCallback(error, null);
            }
        });
    }
    

    function impl_putKorisnik(noviPodaci, fnCallback) {
        $.ajax({
            url: '/korisnik', 
            method: 'PUT',
            data: noviPodaci,
            success: function (data) {
                fnCallback(null, data);
            },
            error: function (error) {
                fnCallback(error, null);
            }
        });
    }

    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        $.ajax({
            url: '/upit', 
            method: 'POST',
            data: { nekretnina_id, tekst_upita },
            success: function (data) {
                fnCallback(null, data);
            },
            error: function (error) {
                fnCallback(error, null);
            }
        });
    }

    function impl_getNekretnine(fnCallback) {
        $.ajax({
            url: '/nekretnine',
            method: 'GET',
            success: function (data) {
                fnCallback(null, data);
            },
            error: function (error) {
                fnCallback(error, null);
            }
        });
    }
    

    function impl_postLogin(username, password, fnCallback) {
        $.ajax({
            url: '/login', 
            method: 'POST',
            data: { username, password },
            success: function (data) {
                fnCallback(null, data);
            },
            error: function (error) {
                fnCallback(error, null);
            }
        });
    }

    function impl_postLogout(fnCallback) {
        $.ajax({
            url: '/logout', 
            method: 'POST',
            success: function (data) {
                fnCallback(null, data);
            },
            error: function (error) {
                fnCallback(error, null);
            }
        });
    }

    function impl_getNekretninaById(nekretnina_id, fnCallback) {
        $.ajax({
            url: `/nekretnine/${nekretnina_id}`, 
            method: 'GET',
            success: function (data) {
                fnCallback(null, data);
            },
            error: function (error) {
                fnCallback(error, null);
            }
        });
    }

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getNekretninaById: impl_getNekretninaById 
    };
})();

