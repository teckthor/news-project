const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credenciais/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipidia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipidia(content) {
    
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
    const wikipediaResponse = await wikipediaAlgorithm.pipe(content.serchTerm)
    const wikipediaContent = wikipediaResponse.get()

    content.sourceContentOriginal = wikipediaContent.content

    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const whithoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        
        content.sourceContentSanitized =  whithoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if(line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }

    function removeDatesInParentheses(text) {
        //console.log("  ")
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        
        sentences.forEach((sentence) => {
            content.sentences.push({
                text:sentence,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robot