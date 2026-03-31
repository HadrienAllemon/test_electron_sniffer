export const formatPrice = (value: number) => {
    const formatter = new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 })
    return formatter.format(value) + "K"
}