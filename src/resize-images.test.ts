import { test, expect } from "vitest"
import { readFile } from "node:fs/promises"
import { resizeImages } from "./resize-images"

test("end to end", { timeout: 10_000 }, async () => {
    await resizeImages()

    const result = await readFile("./src/public/team-photos/processed/images.json")
    expect(result).toMatchSnapshot()
})
