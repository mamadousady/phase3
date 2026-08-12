
var getClassification = function(valeur) {
    if (valeur === undefined || valeur === null || typeof valeur !== 'number' || isNaN(valeur)) {
        return 'inconnu';
    }
    if (valeur < 40) return 'calme';
    if (valeur <= 60) return 'modéré';
    return 'animé';
};


var getEchelles = function() {
    return {
        calme: 40,
        modéré: 60,
        animé: 60
    };
};


var trouverCréneauxCalmes = function(observations) {
    if (!observations || observations.length === 0) return [];
    
    var sorted = observations.slice()
        .filter(function(obs) {
            return obs && obs.valeur !== undefined;
        })
        .sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });

    if (sorted.length === 0) return [];
    
    var creneaux = [];
    var debutCreneau = null;

    for (var i = 0; i < sorted.length; i++) {
        var obs = sorted[i];
        if (obs.valeur < 40) {
            if (!debutCreneau) {
                debutCreneau = new Date(obs.date);
            }
        } else {
            if (debutCreneau) {
                var fin = new Date(obs.date);
                var dureeMinutes = Math.round((fin - debutCreneau) / (1000 * 60));
                if (dureeMinutes > 0) {
                    creneaux.push({
                        debut: debutCreneau.toISOString(),
                        fin: fin.toISOString(),
                        dureeMinutes: dureeMinutes
                    });
                }
                debutCreneau = null;
            }
        }
    }
    
    if (debutCreneau) {
        var fin = new Date(sorted[sorted.length - 1].date);
        var dureeMinutes = Math.round((fin - debutCreneau) / (1000 * 60));
        if (dureeMinutes >= 0) {
            creneaux.push({
                debut: debutCreneau.toISOString(),
                fin: fin.toISOString(),
                dureeMinutes: dureeMinutes
            });
        }
    }
    
    return creneaux;
};


var calculerStatAmbiance = function(observations) {
    if (!observations || observations.length === 0) {
        return {
            moyenne: null,
            min: null,
            max: null,
            ecartType: null,
            nombre: 0
        };
    }

    var valeurs = observations.map(function(o) { return o.valeur; })
        .filter(function(v) { return v !== undefined && v !== null && !isNaN(v); });
    
    if (valeurs.length === 0) {
        return { moyenne: null, min: null, max: null, ecartType: null, nombre: 0 };
    }

    var moyenne = valeurs.reduce(function(a, b) { return a + b; }, 0) / valeurs.length;
    var min = Math.min.apply(null, valeurs);
    var max = Math.max.apply(null, valeurs);
    var variance = valeurs.reduce(function(a, b) { 
        return a + Math.pow(b - moyenne, 2); 
    }, 0) / valeurs.length;
    var ecartType = Math.sqrt(variance);

    return {
        moyenne: Math.round(moyenne * 10) / 10,
        min: min,
        max: max,
        ecartType: Math.round(ecartType * 10) / 10,
        nombre: valeurs.length
    };
};


var formaterLieuAmbiance = function(lieu, derniereObs, nbMesures) {
    return {
        id: lieu._id,
        nom: lieu.nom,
        adresse: lieu.adresse,
        type: lieu.type,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
        ambiance: derniereObs ? {
            classification: getClassification(derniereObs.valeur),
            derniereMesure: {
                valeur: derniereObs.valeur,
                date: derniereObs.date,
                unite: derniereObs.unite || 'dB'
            },
            nombreMesures: nbMesures
        } : {
            classification: 'inconnu',
            derniereMesure: null,
            nombreMesures: 0
        }
    };
};


var formaterAmbianceDetail = function(lieu, observations) {
    var derniereObs = observations.length > 0 ? observations[0] : null;
    var classification = derniereObs ? getClassification(derniereObs.valeur) : 'inconnu';

    var historique = observations.slice()
        .reverse()
        .map(function(obs) {
            return {
                date: obs.date,
                valeur: obs.valeur,
                unite: obs.unite || 'dB',
                notes: obs.notes || '',
                auteur: obs.auteur ? obs.auteur.nom : 'Anonyme'
            };
        });
    
    var creneauxCalmes = trouverCréneauxCalmes(observations);
    var stats = calculerStatAmbiance(observations);

    return {
        lieu: {
            id: lieu._id,
            nom: lieu.nom,
            adresse: lieu.adresse,
            type: lieu.type,
            latitude: lieu.latitude,
            longitude: lieu.longitude
        },
        classification: classification,
        echelles: getEchelles(),
        historique: historique,
        creneauxCalmes: creneauxCalmes,
        derniereMesure: derniereObs ? {
            valeur: derniereObs.valeur,
            date: derniereObs.date,
            unite: derniereObs.unite || 'dB'
        } : null,
        nombreMesures: observations.length,
        stats: stats
    };
};

var validerObservation = function(data) {
    var erreurs = [];
    
    if (!data.lieuId) {
        erreurs.push("L'ID du lieu est requis");
    }
    
    if (data.valeur === undefined || data.valeur === null) {
        erreurs.push("La valeur est requise");
    } else if (data.valeur < 0 || data.valeur > 120) {
        erreurs.push("La valeur doit être comprise entre 0 et 120");
    }
    
    if (data.notes && data.notes.length > 500) {
        erreurs.push("Les notes ne peuvent pas dépasser 500 caractères");
    }
    
    return {
        valide: erreurs.length === 0,
        erreurs: erreurs
    };
};

module.exports = {
    getClassification: getClassification,
    getEchelles: getEchelles,
    trouverCréneauxCalmes: trouverCréneauxCalmes,
    calculerStatAmbiance: calculerStatAmbiance,
    formaterLieuAmbiance: formaterLieuAmbiance,
    formaterAmbianceDetail: formaterAmbianceDetail,
    validerObservation: validerObservation
};