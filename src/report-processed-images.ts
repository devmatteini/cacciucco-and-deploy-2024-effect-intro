import { mkdirSync, readdirSync, writeFileSync } from "node:fs"
import * as path from "node:path"
import sharp from "sharp"
import { imageTypesRegex } from "./images"

export const reportProcessedImages = async (sourceDir: string, outputFile: string, finalImageSrcBaseUrl: string) => {
    console.log(`\nReading images from ${sourceDir}\n`)

    const outputFileAbsolute = path.join(sourceDir, outputFile)

    const tasks = readdirSync(sourceDir)
        // keep-line
        .filter((file) => imageTypesRegex.test(file))
        .map((file) => processOne(path.join(sourceDir, file), finalImageSrcBaseUrl))
    const results = await Promise.all(tasks)

    console.log(`\nWriting results to ${outputFileAbsolute}\n`)

    writeOutputFile(outputFileAbsolute, results)

    console.log(`\nDONE\n`)
}

const processOne = async (file: string, finalImageSrcBaseUrl: string) => {
    const metadata = await sharp(file).metadata()
    const selectedMetadata = pick(["width", "height", "format", "orientation"], metadata)

    const fileName = path.basename(file)
    return { src: `${finalImageSrcBaseUrl}/${fileName}`, ...selectedMetadata }
}

const writeOutputFile = (outputFile: string, content: unknown[]) => {
    const outputFileDir = path.dirname(outputFile)
    mkdirSync(outputFileDir, { recursive: true })
    writeFileSync(outputFile, JSON.stringify(content, null, 2), {})
}

const pick = <T, K extends keyof T>(props: K[], obj: T) =>
    props.reduce(
        (acc, prop) => {
            acc[prop] = obj[prop]
            return acc
        },
        {} as Pick<T, K>,
    )
