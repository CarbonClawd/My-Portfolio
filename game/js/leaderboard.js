// Leaderboard - Local Storage based
class Leaderboard {
    constructor() {
        this.storageKey = 'willsStanleyCupRun_leaderboard';
        this.maxEntries = 10;
        this.entries = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Could not load leaderboard:', e);
        }
        return [];
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
        } catch (e) {
            console.warn('Could not save leaderboard:', e);
        }
    }

    addEntry(name, score, timeSeconds, pucksCollected) {
        const entry = {
            name: name.substring(0, 12),
            score: score,
            time: timeSeconds,
            pucks: pucksCollected,
            date: new Date().toLocaleDateString()
        };

        this.entries.push(entry);

        // Sort: highest score first, then fastest time as tiebreaker
        this.entries.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.time - b.time; // lower time is better
        });

        // Keep only top entries
        if (this.entries.length > this.maxEntries) {
            this.entries = this.entries.slice(0, this.maxEntries);
        }

        this.save();

        // Return the rank (1-based)
        const rank = this.entries.findIndex(e =>
            e.name === entry.name && e.score === entry.score && e.time === entry.time
        );
        return rank + 1;
    }

    getEntries() {
        return this.entries;
    }

    isHighScore(score) {
        if (this.entries.length < this.maxEntries) return true;
        return score > this.entries[this.entries.length - 1].score;
    }

    clear() {
        this.entries = [];
        this.save();
    }

    // Format time as M:SS
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}
