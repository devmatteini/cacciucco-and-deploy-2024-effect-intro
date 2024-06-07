import { compressImages, compressImagesEffect } from "./compress-images"
import { reportProcessedImages } from "./report-processed-images"
import * as path from "node:path"

const sourceDirRelative = "./public/team-photos"
const sourceDirAbsolute = new URL(sourceDirRelative, import.meta.url).pathname
const compressOutputDir = "processed"

const processedDirAbsolute = path.join(sourceDirAbsolute, compressOutputDir)
const finalImageSrcBaseUrl = `/team-photos/${compressOutputDir}`
const jsonOutputFile = "images.json"

import * as Effect from "effect/Effect"
import { NodeContext, NodeFileSystem } from "@effect/platform-node"

export const resizeImages = async () => {
    await Effect.runPromise(
        compressImagesEffect(sourceDirAbsolute, compressOutputDir).pipe(
            Effect.provide(NodeFileSystem.layer),
            Effect.catchTag("DirectoryNotExists", (error) =>
                Effect.dieMessage(
                    `Error directory not exits ${error.sourceDir}`,
                ),
            ),
            Effect.withConcurrency(10),
        ),
    )
    await reportProcessedImages(
        processedDirAbsolute,
        jsonOutputFile,
        finalImageSrcBaseUrl,
    )
}
