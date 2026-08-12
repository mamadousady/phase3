const authService=require('../../services/authService');
describe('Auth Service - Tests unitaires', () => {
    describe('validerEmail', () => {
        test('accepte un email valide', () => {
            const testEmails = [
                'test@example.com',
                'user.name@domain.co',
                'test+filter@gmail.com',
                'admin@sub.domain.com'
            ];
            testEmails.forEach(email => {
                const result = authService.validerEmail(email);
                expect(result.valide).toBe(true);
                expect(result.erreur).toBeUndefined();
            });
        });
        test('rejette un email invalide', () => {
            const testEmails = [
                'test@',
                'test@example',
                'test.example.com',
                '@example.com',
                'test',
                '',
                null,
                undefined
            ];
            testEmails.forEach(email => {
                const result = authService.validerEmail(email);
                expect(result.valide).toBe(false);
                expect(result.erreur).toBeDefined();
            });
        });
        test('retourne un message d\'erreur approprié', () => {
            const result = authService.validerEmail('test@');
            expect(result.erreur).toBe('Format d\'email invalide');
        });

        test('retourne "L\'email est requis" pour null/undefined', () => {
            const result = authService.validerEmail(null);
            expect(result.erreur).toBe('L\'email est requis');
        });
    });
    describe('validerMotDePasse', () => {
        test('accepte un mot de passe de 6+ caractères', () => {
            const testPasswords = ['123456', 'abcdef', 'password', '1234567890'];
            testPasswords.forEach(mdp => {
                const result = authService.validerMotDePasse(mdp);
                expect(result.valide).toBe(true);
                expect(result.erreur).toBeUndefined();
            });
        });

        test('rejette un mot de passe trop court (< 6 caractères)', () => {
            const testPasswords = ['12345', 'abcde', '123', '34', 'a'];
            testPasswords.forEach(mdp => {
                const result = authService.validerMotDePasse(mdp);
                expect(result.valide).toBe(false);
                expect(result.erreur).toBe('Le mot de passe doit avoir au moins 6 caractères');
            });
        });
        test('rejette un mot de passe null/undefined', () => {
            const result = authService.validerMotDePasse(null);
            expect(result.valide).toBe(false);
            expect(result.erreur).toBe('Le mot de passe est requis');
        });

        test('accepte des caractères spéciaux', () => {
            const result = authService.validerMotDePasse('MotDePasse123!@#');
            expect(result.valide).toBe(true);
        });
    });
    describe('validerNom', () => {
        test('accepte un nom valide (2-50 caractères)', () => {
            const testNoms = ['Jean', 'Marie-Claude', 'John Doe', 'A'.repeat(50)];
            testNoms.forEach(nom => {
                const result = authService.validerNom(nom);
                expect(result.valide).toBe(true);
                expect(result.erreur).toBeUndefined();
            });
        });

        test('rejette un nom trop court (< 2 caractères)', () => {
            const result = authService.validerNom('A');
            expect(result.valide).toBe(false);
            expect(result.erreur).toBe('Le nom doit avoir au moins 2 caractères');
        });

        test('rejette un nom trop long (> 50 caractères)', () => {
            const nomLong = 'A'.repeat(51);
            const result = authService.validerNom(nomLong);
            expect(result.valide).toBe(false);
            expect(result.erreur).toBe('Le nom ne peut pas dépasser 50 caractères');
        });

        test('rejette un nom null/undefined', () => {
            const result = authService.validerNom(null);
            expect(result.valide).toBe(false);
            expect(result.erreur).toBe('Le nom est requis');
        });

        test('rejette un nom vide', () => {
            const result = authService.validerNom('');
            expect(result.valide).toBe(false);
            expect(result.erreur).toBe('Le nom est requis');
        });

        test('accepte un nom avec des accents', () => {
            const result = authService.validerNom('Émilie Dupré');
            expect(result.valide).toBe(true);
        });
    });

    describe('validerInscription', () => {
        const testData = {
            nom: 'Jean Dupont',
            email: 'jean@example.com',
            motDePasse: 'password123'
        };

        test('valide des données d\'inscription correctes', () => {
            const result = authService.validerInscription(testData);
            expect(result.valide).toBe(true);
            expect(result.erreurs).toEqual([]);
        });
        test('rejette des données avec des champs manquants', () => {
            const dataSansNom = { email: 'test@example.com', motDePasse: 'password' };
            const result = authService.validerInscription(dataSansNom);
            expect(result.valide).toBe(false);
            expect(result.erreurs).toContain('Le nom est requis');
        });

        test('rejette des données avec plusieurs erreurs', () => {
            const dataInvalide = { nom: 'J', email: 'invalid', motDePasse: '123' };
            const result = authService.validerInscription(dataInvalide);
            expect(result.valide).toBe(false);
            expect(result.erreurs.length).toBe(3);
            expect(result.erreurs).toContain('Le nom doit avoir au moins 2 caractères');
            expect(result.erreurs).toContain('Format d\'email invalide');
            expect(result.erreurs).toContain('Le mot de passe doit avoir au moins 6 caractères');
        });
    });
    describe('validerConnexion', () => {
        test('valide des données de connexion correctes', () => {
            const data = { email: 'test@example.com', motDePasse: 'password' };
            const result = authService.validerConnexion(data);
            expect(result.valide).toBe(true);
            expect(result.erreurs).toEqual([]);
        });

        test('rejette un email invalide', () => {
            const data = { email: 'invalid', motDePasse: 'password' };
            const result = authService.validerConnexion(data);
            expect(result.valide).toBe(false);
            expect(result.erreurs).toContain('Format d\'email invalide');
        });

        test('rejette un mot de passe manquant', () => {
            const data = { email: 'test@example.com' };
            const result = authService.validerConnexion(data);
            expect(result.valide).toBe(false);
            expect(result.erreurs).toContain('Le mot de passe est requis');
        });
    });
    describe('formaterUtilisateurReponse', () => {
        const utilisateur = {
            _id: '123456',
            nom: 'Test User',
            email: 'test@example.com',
            createdAt: new Date('2026-01-01')
        };
        const token = 'jwt-token-123';

        test('formate correctement la réponse utilisateur', () => {
            const result = authService.formaterUtilisateurReponse(utilisateur, token);
            expect(result.token).toBe(token);
            expect(result.utilisateur).toEqual({
                id: utilisateur._id,
                nom: utilisateur.nom,
                email: utilisateur.email,
                createdAt: utilisateur.createdAt
            });
        });
        test('gère un utilisateur sans createdAt', () => {
            const utilisateurSansDate = { ...utilisateur, createdAt: undefined };
            const result = authService.formaterUtilisateurReponse(utilisateurSansDate, token);
            expect(result.utilisateur.createdAt).toBeUndefined();
            expect(result.utilisateur.id).toBe(utilisateur._id);
        });

        test('gère un token différent', () => {
            const result1 = authService.formaterUtilisateurReponse(utilisateur, 'token1');
            const result2 = authService.formaterUtilisateurReponse(utilisateur, 'token2');
            expect(result1.token).toBe('token1');
            expect(result2.token).toBe('token2');
            expect(result1.utilisateur).toEqual(result2.utilisateur);
        });

    });
});