import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readdirSync,
    rmSync,
    statSync,
} from "node:fs"
import * as path from "node:path"
import sharp from "sharp"
import { imageTypesRegex } from "./images"
import { Effect } from "effect"
import { FileSystem } from "@effect/platform"

const WIDTH_THRESHOLD = 1500

import * as Data from "effect/Data"

export class DirectoryNotExists extends Data.TaggedError("DirectoryNotExists")<{
    sourceDir: string
}> {
    override toString(): string {
        return `Source directory ${this.sourceDir} does not exist`
    }
}

export const compressImagesEffect = (sourceDir: string, outputDir: string) =>
    Effect.gen(function* (_) {
        const fs = yield* _(FileSystem.FileSystem)

        const sourceDirExists = yield* _(
            fs.exists(sourceDir),
            Effect.mapError((x) => {
                return new Error(`Foo bar error`, { cause: x })
            }),
        )
        if (!sourceDirExists) {
            return yield* _(Effect.fail(new DirectoryNotExists({ sourceDir })))
        }

        console.log(`\nReading images from ${sourceDir}\n`)

        const outputDirAbsolute = path.join(sourceDir, outputDir)
        yield* _(fs.remove(outputDirAbsolute, { recursive: true, force: true }))
        yield* _(fs.makeDirectory(outputDirAbsolute, { recursive: true }))

        const sourceDirFiles = yield* _(fs.readDirectory(sourceDir))
        const tasks = sourceDirFiles
            .filter((file) => imageTypesRegex.test(file))
            .map((file) =>
                Effect.promise(() =>
                    processOne(path.join(sourceDir, file), outputDirAbsolute),
                ),
            )

        const results = yield* _(Effect.all(tasks, { concurrency: "inherit" }))

        console.log(`\nProcessed ${results.length} images \n`)
        console.log(`\nDONE\n`)
    })

export const compressImages = async (sourceDir: string, outputDir: string) => {
    // if (!existsSync(sourceDir)) {
    //     console.error(`\nSource directory ${sourceDir} does not exist\n`)
    //     process.exit(1)
    // }
    // console.log(`\nReading images from ${sourceDir}\n`)
    // const outputDirAbsolute = path.join(sourceDir, outputDir)
    // rmSync(outputDirAbsolute, { recursive: true, force: true })
    // mkdirSync(outputDirAbsolute, { recursive: true })
    // const tasks = readdirSync(sourceDir)
    //     // keep-line
    //     .filter((file) => imageTypesRegex.test(file))
    //     .map((file) =>
    //         processOne(path.join(sourceDir, file), outputDirAbsolute),
    //     )
    // const results = await Promise.all(tasks)
    //
    // console.log(`\nProcessed ${results.length} images \n`)
    // console.log(`\nDONE\n`)
}

const processOne = async (inputFile: string, outputDir: string) => {
    const fileName = path.basename(inputFile)
    const outputFile = path.join(outputDir, `${fileName}.webp`)

    const metadata = await sharp(inputFile).metadata()
    const stat = statSync(inputFile)
    const sizeInKb = stat.size / 1024

    if (sizeInKb < 50 || !metadata.width || metadata.width < WIDTH_THRESHOLD) {
        copyFileSync(inputFile, outputFile)
        return { name: outputFile }
    } else {
        const info = await sharp(inputFile)
            .resize({ width: WIDTH_THRESHOLD, withoutEnlargement: true })
            .withMetadata()
            .webp({ lossless: false, quality: 80 })
            .toFile(outputFile)
        return { name: outputFile, ...info }
    }
}
