const lieuService = require('../../services/lieuServices');

describe('Lieu Service - Tests unitaires', () => {
    describe('getClassification', () => {
        test('retourne "calme" pour une valeur < 40', () => {
            expect(lieuService.getClassification(0)).toBe('calme');
            expect(lieuService.getClassification(35)).toBe('calme');
            expect(lieuService.getClassification(39.9)).toBe('calme');
            expect(lieuService.getClassification(-10)).toBe('calme');
        });

        test('retourne "modéré" pour une valeur entre 40 et 60', () => {
            expect(lieuService.getClassification(40)).toBe('modéré');
            expect(lieuService.getClassification(50)).toBe('modéré');
            expect(lieuService.getClassification(60)).toBe('modéré');
        });

        test('retourne "animé" pour une valeur > 60', () => {
            expect(lieuService.getClassification(61)).toBe('animé');
            expect(lieuService.getClassification(80)).toBe('animé');
            expect(lieuService.getClassification(120)).toBe('animé');
        });

        test('retourne "inconnu" pour des valeurs invalides', () => {
            expect(lieuService.getClassification(null)).toBe('inconnu');
            expect(lieuService.getClassification(undefined)).toBe('inconnu');
            expect(lieuService.getClassification(NaN)).toBe('inconnu');
            expect(lieuService.getClassification('abc')).toBe('inconnu');
        });
    });
    describe('getEchelles', () => {
        test('retourne les échelles correctes', () => {
            const echelles = lieuService.getEchelles();
            expect(echelles).toEqual({
                calme: 40,
                modéré: 60,
                animé: 60
            });
            expect(echelles.calme).toBe(40);
            expect(echelles.modéré).toBe(60);
            expect(echelles.animé).toBe(60);
        });

        test('retourne un objet immuable', () => {
            const echelles1 = lieuService.getEchelles();
            const echelles2 = lieuService.getEchelles();
            expect(echelles1).not.toBe(echelles2);
            expect(echelles1).toEqual(echelles2);
        });
    });
    describe('trouverCreneauxCalmes', () => {
        const createObservation = (valeur, date) => ({
            valeur,
            date: new Date(date)
        });

        test('retourne un tableau vide si pas d\'observations', () => {
            expect(lieuService.trouverCréneauxCalmes([])).toEqual([]);
            expect(lieuService.trouverCréneauxCalmes(null)).toEqual([]);
            expect(lieuService.trouverCréneauxCalmes(undefined)).toEqual([]);
        });

        test('retourne un tableau vide si toutes les observations sont animées', () => {
            const observations = [
                createObservation(70, '2026-06-29T09:00:00Z'),
                createObservation(80, '2026-06-29T10:00:00Z'),
                createObservation(65, '2026-06-29T11:00:00Z')
            ];
            expect(lieuService.trouverCréneauxCalmes(observations)).toEqual([]);
        });
        test('identifie correctement les créneaux calmes', () => {
            const observations = [
                createObservation(30, '2026-06-29T09:00:00Z'),
                createObservation(45, '2026-06-29T10:00:00Z'),
                createObservation(35, '2026-06-29T11:00:00Z'),
                createObservation(55, '2026-06-29T12:00:00Z'),
                createObservation(25, '2026-06-29T13:00:00Z')
            ];
            
            const result = lieuService.trouverCréneauxCalmes(observations);
            expect(result.length).toBe(3);
            expect(result[0].dureeMinutes).toBe(60);
            expect(result[1].dureeMinutes).toBe(60); 
            expect(result[2].dureeMinutes).toBe(0); 
        });

        test('gère les créneaux qui continuent jusqu\'à la fin', () => {
            const observations = [
                createObservation(30, '2026-06-29T09:00:00Z'),
                createObservation(25, '2026-06-29T10:00:00Z'),
                createObservation(35, '2026-06-29T11:00:00Z')
            ];
            const result = lieuService.trouverCréneauxCalmes(observations);
            expect(result.length).toBe(1);
            expect(result[0].dureeMinutes).toBeGreaterThan(0);
        });
    });
    describe('calculerStatsAmbiance', () => {
        const createObservation = (valeur) => ({ valeur });

        test('retourne null pour toutes les stats si pas d\'observations', () => {
            const stats = lieuService.calculerStatAmbiance([]);
            expect(stats.moyenne).toBeNull();
            expect(stats.min).toBeNull();
            expect(stats.max).toBeNull();
            expect(stats.ecartType).toBeNull();
            expect(stats.nombre).toBe(0);
        });

        test('calcule correctement les statistiques', () => {
            const observations = [
                createObservation(30),
                createObservation(45),
                createObservation(50),
                createObservation(35)
            ];
            
            const stats = lieuService.calculerStatAmbiance(observations);
            expect(stats.moyenne).toBe(40);
            expect(stats.min).toBe(30);
            expect(stats.max).toBe(50);
            expect(stats.nombre).toBe(4);
            expect(stats.ecartType).toBeCloseTo(7.9, 1);
        });

        test('gère une seule observation', () => {
            const observations = [createObservation(45)];
            const stats = lieuService.calculerStatAmbiance(observations);
            expect(stats.moyenne).toBe(45);
            expect(stats.min).toBe(45);
            expect(stats.max).toBe(45);
            expect(stats.ecartType).toBe(0);
            expect(stats.nombre).toBe(1);
        });
    });
    describe('formaterLieuAvecAmbiance', () => {
        const lieu = {
            _id: '123',
            nom: 'Test Lieu',
            adresse: '123 Test St',
            type: 'café',
            latitude: 45.5017,
            longitude: -73.5673
        };

        test('formate correctement avec une observation', () => {
            const derniereObs = {
                valeur: 45,
                date: new Date('2026-06-29T10:00:00Z'),
                unite: 'dB'
            };

            const nbMesures = 5;

            const result = lieuService.formaterLieuAmbiance(lieu, derniereObs, nbMesures);
            expect(result.id).toBe('123');
            expect(result.nom).toBe('Test Lieu');
            expect(result.ambiance.classification).toBe('modéré');
            expect(result.ambiance.derniereMesure.valeur).toBe(45);
            expect(result.ambiance.nombreMesures).toBe(5);
        });

        test('formate correctement sans observation', () => {
            const result = lieuService.formaterLieuAmbiance(lieu, null, 0);
            expect(result.id).toBe('123');
            expect(result.ambiance.classification).toBe('inconnu');
            expect(result.ambiance.derniereMesure).toBeNull();
            expect(result.ambiance.nombreMesures).toBe(0);
        });
        test('gère les champs manquants', () => {
            const lieuPartiel = { _id: '456', nom: 'Sans adresse' };
            const result = lieuService.formaterLieuAmbiance(lieuPartiel, null, 0);
            expect(result.id).toBe('456');
            expect(result.nom).toBe('Sans adresse');
            expect(result.adresse).toBeUndefined();
            expect(result.ambiance.classification).toBe('inconnu');
        });
    });
    describe('formaterAmbianceDetaillee', () => {
        const lieu = {
            _id: '123',
            nom: 'Test Lieu',
            adresse: '123 Test St',
            type: 'café',
            latitude: 45.5017,
            longitude: -73.5673
        };

        const observations = [
            { valeur: 45, date: new Date('2026-06-29T10:00:00Z'), unite: 'dB', notes: 'Note 1', auteur: { nom: 'Alice' } },
            { valeur: 30, date: new Date('2026-06-29T09:00:00Z'), unite: 'dB', notes: 'Note 2', auteur: null }
        ];

        test('formate correctement les données détaillées', () => {
            const result = lieuService.formaterAmbianceDetail(lieu, observations);
            
            expect(result.lieu.id).toBe('123');
            expect(result.classification).toBe('modéré');
            expect(result.echelles).toBeDefined();
            expect(result.historique.length).toBe(2);
            expect(result.historique[0].valeur).toBe(30);
            expect(result.historique[1].valeur).toBe(45);
            expect(result.creneauxCalmes).toBeDefined();
            expect(result.nombreMesures).toBe(2);
            expect(result.stats).toBeDefined();
            expect(result.stats.moyenne).toBe(37.5);
        });
        test('gère les observations sans auteur', () => {
            const obsSansAuteur = observations.map(o => ({ ...o, auteur: null }));
            const result = lieuService.formaterAmbianceDetail(lieu, obsSansAuteur);
            expect(result.historique[0].auteur).toBe('Anonyme');
            expect(result.historique[1].auteur).toBe('Anonyme');
        });

        test('retourne le statut "inconnu" sans observations', () => {
            const result = lieuService.formaterAmbianceDetail(lieu, []);
            expect(result.classification).toBe('inconnu');
            expect(result.historique).toEqual([]);
            expect(result.creneauxCalmes).toEqual([]);
            expect(result.derniereMesure).toBeNull();
            expect(result.nombreMesures).toBe(0);
        });

        test('gère un lieu sans type', () => {
            const lieuSansType = { ...lieu, type: undefined };
            const result = lieuService.formaterAmbianceDetail(lieuSansType, observations);
            expect(result.lieu.type).toBeUndefined();
            expect(result.classification).toBe('modéré');
        });
    });
    describe('validerObservation', () => {
        test('valide une observation correcte', () => {
            const data = { lieuId: '123', valeur: 45, notes: 'Test' };
            const result = lieuService.validerObservation(data);
            expect(result.valide).toBe(true);
            expect(result.erreurs).toEqual([]);
        });

        test('rejette une observation sans lieuId', () => {
            const data = { valeur: 45 };
            const result = lieuService.validerObservation(data);
            expect(result.valide).toBe(false);
            expect(result.erreurs).toContain("L'ID du lieu est requis");
        });
        test('rejette une observation sans valeur', () => {
            const data = { lieuId: '123' };
            const result = lieuService.validerObservation(data);
            expect(result.valide).toBe(false);
            expect(result.erreurs).toContain("La valeur est requise");
        });

        test('rejette une valeur négative', () => {
            const data = { lieuId: '123', valeur: -10 };
            const result = lieuService.validerObservation(data);
            expect(result.valide).toBe(false);
            expect(result.erreurs).toContain("La valeur doit être comprise entre 0 et 120");
        });

        test('rejette une valeur > 120', () => {
            const data = { lieuId: '123', valeur: 150 };
            const result = lieuService.validerObservation(data);
            expect(result.valide).toBe(false);
            expect(result.erreurs).toContain("La valeur doit être comprise entre 0 et 120");
        });

        
        test('gère plusieurs erreurs simultanément', () => {
            const data = { valeur: 150 }; // Pas de lieuId, valeur invalide
            const result = lieuService.validerObservation(data);
            expect(result.valide).toBe(false);
            expect(result.erreurs.length).toBe(2);
            expect(result.erreurs).toContain("L'ID du lieu est requis");
            expect(result.erreurs).toContain("La valeur doit être comprise entre 0 et 120");
        });
    });
});



