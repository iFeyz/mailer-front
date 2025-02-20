🦀 #RustLang Astuce du Jour

Le système de types de Rust nous permet de définir des "types marqueurs" (marker types), qui sont des structures ne contenant que leur nom, pour encoder des métadonnées sur un type spécifique.

Exemple concret avec un document qui peut être en état "Brouillon" ou "Publié" :

```rust
// Types marqueurs pour l'état du document
struct Brouillon;
struct Publie;

// Document générique avec un paramètre de type pour son état
struct Document<Etat> {
    contenu: String,
    _etat: std::marker::PhantomData<Etat>,
}

// Implémentations spécifiques selon l'état
impl Document<Brouillon> {
    fn publier(self) -> Document<Publie> {
        Document {
            contenu: self.contenu,
            _etat: std::marker::PhantomData,
        }
    }
}

impl Document<Publie> {
    fn partager(&self) {
        println!("Document partagé !");
    }
}
```

💡 Avantages :
- Sûreté au niveau du typage : impossible d'appeler `partager()` sur un brouillon
- États gérés au moment de la compilation
- Zéro coût à l'exécution

#Rust #Programmation #TypeSystem #DeveloppementLogiciel #RustProgramming 