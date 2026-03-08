export default defineEventHandler(async (event) => {
    const stream = createEventStream(event)

    let current_price = 100
    const interval = setInterval(() => {
        const change = (Math.random() - 0.5) * 0.15
        current_price += change
        stream.push(
            JSON.stringify({
                price: Math.round(current_price * 100) / 100,
                timestamp: Date.now(),
            }),
        )
    }, 16)

    stream.onClosed(() => {
        clearInterval(interval)
    })

    return stream.send()
})
