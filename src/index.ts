import { resizeImages } from "./resize-images"

resizeImages()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
