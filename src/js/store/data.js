export default {
    clans: [],
    disciplines: [],
    backgrounds: [],
    merits: [],
    flaws: [],
    paths: [],
    natureDemeanor: [],

    async init() {
        const [clans, disciplines, backgrounds, merits, flaws, paths, natureDemeanor] = await Promise.all([
            fetch('data/V20/clan_bloodline.json').then(r => r.json()),
            fetch('data/V20/disciplines.json').then(r => r.json()),
            fetch('data/V20/backgrounds.json').then(r => r.json()),
            fetch('data/V20/merits.json').then(r => r.json()),
            fetch('data/V20/flaws.json').then(r => r.json()),
            fetch('data/V20/paths.json').then(r => r.json()),
            fetch('data/V20/nature_demeanor.json').then(r => r.json()),
        ])

        this.clans = clans
        this.disciplines = disciplines
        this.backgrounds = backgrounds
        this.merits = merits
        this.flaws = flaws
        this.paths = paths
        this.natureDemeanor = natureDemeanor

        console.log('Data store initialized:', {
            clans: this.clans,
            disciplines: this.disciplines,
            backgrounds: this.backgrounds,
            merits: this.merits,
            flaws: this.flaws,
            paths: this.paths,
            natureDemeanor: this.natureDemeanor,
        })
    }
}