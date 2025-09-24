export interface DatabaseBackup {
  version: string;
  timestamp: string;
  data: {
    incomes: any[];
    expenses: any[];
    categories: any[];
  };
}

export class LocalDatabase {
  private static readonly STORAGE_KEYS = {
    INCOMES: 'budget_incomes',
    EXPENSES: 'budget_expenses',
    CATEGORIES: 'budget_categories',
    BACKUP_PREFIX: 'budget_backup_',
    SETTINGS: 'budget_settings'
  };

  private static readonly VERSION = '1.0.0';

  // Sauvegarder les données
  static saveData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw new Error('Impossible de sauvegarder les données');
    }
  }

  // Charger les données
  static loadData<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      return defaultValue;
    }
  }

  // Créer une sauvegarde complète
  static createBackup(): DatabaseBackup {
    const backup: DatabaseBackup = {
      version: this.VERSION,
      timestamp: new Date().toISOString(),
      data: {
        incomes: this.loadData(this.STORAGE_KEYS.INCOMES, []),
        expenses: this.loadData(this.STORAGE_KEYS.EXPENSES, []),
        categories: this.loadData(this.STORAGE_KEYS.CATEGORIES, [])
      }
    };

    // Sauvegarder automatiquement
    const backupKey = `${this.STORAGE_KEYS.BACKUP_PREFIX}${Date.now()}`;
    this.saveData(backupKey, backup);

    return backup;
  }

  // Restaurer depuis une sauvegarde
  static restoreFromBackup(backup: DatabaseBackup): void {
    try {
      this.saveData(this.STORAGE_KEYS.INCOMES, backup.data.incomes);
      this.saveData(this.STORAGE_KEYS.EXPENSES, backup.data.expenses);
      this.saveData(this.STORAGE_KEYS.CATEGORIES, backup.data.categories);
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      throw new Error('Impossible de restaurer les données');
    }
  }

  // Exporter les données en JSON
  static exportToJSON(): string {
    const backup = this.createBackup();
    return JSON.stringify(backup, null, 2);
  }

  // Importer depuis JSON
  static importFromJSON(jsonString: string): void {
    try {
      const backup: DatabaseBackup = JSON.parse(jsonString);
      
      // Vérifier la structure
      if (!backup.data || !backup.version) {
        throw new Error('Format de fichier invalide');
      }

      this.restoreFromBackup(backup);
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      throw new Error('Fichier invalide ou corrompu');
    }
  }

  // Obtenir toutes les sauvegardes
  static getBackups(): Array<{ key: string; backup: DatabaseBackup }> {
    const backups: Array<{ key: string; backup: DatabaseBackup }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEYS.BACKUP_PREFIX)) {
        try {
          const backup = JSON.parse(localStorage.getItem(key) || '');
          backups.push({ key, backup });
        } catch (error) {
          console.error('Sauvegarde corrompue:', key);
        }
      }
    }

    return backups.sort((a, b) => 
      new Date(b.backup.timestamp).getTime() - new Date(a.backup.timestamp).getTime()
    );
  }

  // Supprimer une sauvegarde
  static deleteBackup(key: string): void {
    localStorage.removeItem(key);
  }

  // Nettoyer les anciennes sauvegardes (garder les 5 plus récentes)
  static cleanOldBackups(): void {
    const backups = this.getBackups();
    if (backups.length > 5) {
      backups.slice(5).forEach(({ key }) => {
        this.deleteBackup(key);
      });
    }
  }

  // Effacer toutes les données
  static clearAllData(): void {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
      localStorage.removeItem(this.STORAGE_KEYS.INCOMES);
      localStorage.removeItem(this.STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(this.STORAGE_KEYS.CATEGORIES);
      
      // Nettoyer aussi les sauvegardes
      const backups = this.getBackups();
      backups.forEach(({ key }) => this.deleteBackup(key));
    }
  }

  // Obtenir les statistiques de stockage
  static getStorageStats(): {
    used: number;
    total: number;
    percentage: number;
    itemCount: number;
  } {
    let used = 0;
    let itemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('budget_')) {
        const value = localStorage.getItem(key) || '';
        used += key.length + value.length;
        itemCount++;
      }
    }

    // Estimation de la limite (généralement 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB
    const percentage = (used / total) * 100;

    return { used, total, percentage, itemCount };
  }
}