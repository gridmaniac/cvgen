const fs = require('fs'),
      moment = require('moment')

const Koa = require('koa'),
      app = new Koa()

app
    .use(require('koa-bodyparser')())
    .use(require('koa-json')())
    .use(require('koa-static')(__dirname + '/web'))

const Router = require('koa-router'),
      router = new Router()

router.post('/', (ctx) => {
    const lexicon = initLexicon()
    const data = ctx.request.body

    let specs = ['backend-developer', 'frontend-developer']
    if (data.specs)
        specs = data.specs

    let level = 'senior'

    if (data.level)
        level = data.level

    let name = lexicon['common'].names.splice(Math.random() * lexicon['common'].names.length | 0, 1)[0]
    let sname = lexicon['common'].snames.splice(Math.random() * lexicon['common'].snames.length | 0, 1)[0]

    if (data.autoname != 'true') {
        name = data.name
        sname = data.sname
    }

    let role = 'Веб-разработчик'
    if (data.role)
        role = data.role
    
    const cv = generateCV(name, sname, specs, level, role, lexicon)
    
    ctx.body = {
        cv
    }
})

app
    .use(router.routes())

app.listen(18200)

function generateCV(name, sname, specs, level, role, lexicon) {
    
    let years = 0,
        companies = 0,
        skills = 0
    
    switch (level) {
        case 'junior':
            years = getRandomInt(1, 1)
            companies = getRandomInt(1, 2)
            skills = 6
            break;
        case 'middle':
            years = getRandomInt(2, 4)
            companies = getRandomInt(2, 5)
            skills = 9
            break;
        case 'senior':
            years = getRandomInt(4, 10)
            companies = getRandomInt(3, 7)
            skills = 12
            break;
        case 'legendary':
            years = getRandomInt(7, 20)
            companies = getRandomInt(5, 12)
            skills = 15
            break;
    }
    
    let y = ''
    if (years == 1) {
        y = 'год'
    }
    
    if (years > 1 && years < 5) {
        y = 'года'
    }
    
    if (years > 4) {
        y = 'лет'
    }
    
    const exp = `Опыт работы: ${years} ${y}`
    
    let about = ''
    for (let i = 0; i < 6; i++) {
        about += lexicon['common'].about.splice(Math.random() * lexicon['common'].about.length | 0, 1)[0] + '. '
    }
    
    const contributions = lexicon['common'].contributions
    for (let spec of specs) {
        if (lexicon[spec].contributions) {
            for (let c of lexicon[spec].contributions) {
                contributions.push(c)
            }
        }
    }

    const roles = lexicon['common'].roles
    for (let spec of specs) {
        if (lexicon[spec].roles) {
            for (let r of lexicon[spec].roles) {
                roles.push(r)
            }
        }
    }
    
    const work = []
    
    let range = years / companies
    range = range * 365 * 24 * 60 * 60
    syears = years * 365 * 24 * 60 * 60
    
    for (let i = 0; i < companies; i++) {
        const start = moment().subtract(range * i, 'seconds')
        const end = moment(start).add(range, 'seconds')
    
        const cons = []
        for (let j = 0; j < getRandomInt(2, 7); j++) {
            cons.push(contributions.splice(Math.random() * contributions.length | 0, 1)[0])
        }
    
        work.push({
            start: start.format('DD.MM.YY'),
            end: moment().add(2, 'months') > end ? end.format('DD.MM.YY') : 'Наст. время',
            role: roles.splice(Math.random() * roles.length | 0, 1)[0],
            company: lexicon['common'].companies.splice(Math.random() * lexicon['common'].companies.length | 0, 1)[0],
            contributions: cons
        })
    }
    
    const generalSkills = []
    for (i = 0; i < getRandomInt(skills - 1, skills + 1 ); i++) {
        generalSkills.push(lexicon['common'].skills.splice(Math.random() * lexicon['common'].skills.length | 0, 1)[0])
    }
    
    const proSkills = []
    for (let spec of specs) {
        for (i = 0; i < getRandomInt(skills - 1, skills + 1 ); i++) {
            proSkills.push(lexicon[spec].skills.splice(Math.random() * lexicon[spec].skills.length | 0, 1)[0])
        }
    }

    const photos = fs.readFileSync(`${__dirname}/photos.txt`, 'utf8').split(/\r?\n/)
    
    return {
        name,
        sname,
        role,
        exp,
        about,
        work,
        generalSkills,
        proSkills,
        photo: photos.splice(Math.random() * photos.length | 0, 1)[0]
    }
}

function initLexicon() {
    const lexicon = {}
        
    const lexiconPaths = [
        '3d-artist', 
        'backend-developer', 
        'backend-developer-aspnet',
        'backend-developer-nodejs',
        'backend-developer-ruby',
        'blockchain-expert',
        'data-scientist',
        'desktop-developer',
        'devops-developer',
        'frontend-developer',
        'game-developer',
        'mobile-developer-android',
        'mobile-developer-hybrid',
        'mobile-developer-ios',
        'software-test-engineer'
    ]

    for (let path of lexiconPaths) {
        lexicon[path] = {}
        
        const skills = fs.readFileSync(`${__dirname}/lexicon/${path}/skills.txt`, 'utf8')
        lexicon[path].skills = skills.split(/\r?\n/)

        if (fs.existsSync(`${__dirname}/lexicon/${path}/contributions.txt`)) {
            const contributions = fs.readFileSync(`${__dirname}/lexicon/${path}/contributions.txt`, 'utf8')
            lexicon[path].contributions = contributions.split(/\r?\n/)
        }

        if (fs.existsSync(`${__dirname}/lexicon/${path}/roles.txt`)) {
            const roles = fs.readFileSync(`${__dirname}/lexicon/${path}/roles.txt`, 'utf8')
            lexicon[path].roles = roles.split(/\r?\n/)
        }
    }

    lexicon['common'] = {}
    lexicon['common'].about = fs.readFileSync(`${__dirname}/lexicon/common/about.txt`, 'utf8').split(/\r?\n/)
    lexicon['common'].companies = fs.readFileSync(`${__dirname}/lexicon/common/companies.txt`, 'utf8').split(/\r?\n/)
    lexicon['common'].contributions = fs.readFileSync(`${__dirname}/lexicon/common/contributions.txt`, 'utf8').split(/\r?\n/)
    lexicon['common'].names = fs.readFileSync(`${__dirname}/lexicon/common/names.txt`, 'utf8').split(/\r?\n/)
    lexicon['common'].skills = fs.readFileSync(`${__dirname}/lexicon/common/skills.txt`, 'utf8').split(/\r?\n/)
    lexicon['common'].snames = fs.readFileSync(`${__dirname}/lexicon/common/snames.txt`, 'utf8').split(/\r?\n/)
    lexicon['common'].roles = fs.readFileSync(`${__dirname}/lexicon/common/roles.txt`, 'utf8').split(/\r?\n/)

    return lexicon
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}