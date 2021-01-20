import runTransformation from '../../dist/src/runTransformation'

const transfrom = process.argv[2]
const options = JSON.parse(process.argv[3] || '{}')

let input = ''
process.stdin.on('data', (e) => {
  input += e.toString()
})

process.stdin.on('end', () => {
  try {
    console.log(
      runTransformation(
        {
          source: input,
          path: 'anonymous.vue',
        },
        require(`../../transformations/${transfrom}.ts`),
        options
      )
    )
  } catch (e) {
    console.error(e)
  }
})
