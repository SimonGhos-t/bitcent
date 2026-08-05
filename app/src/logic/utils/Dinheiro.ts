export default class Dinheiro {
    private static _lingua = 'pt-BR'
    private static _moeda = 'BRL'

    static formatar(num: number): string {
        return (num ?? 0).toLocaleString(Dinheiro._lingua, {
            style: 'currency', currency: Dinheiro._moeda
        })  
    }
    
    static desformatar(valor: string): number {
        const numeros = valor.replace(/[^0-9]+/g, '')
        const i = numeros.length - 2
        return Number(`${numeros.substring(0, i)}.${numeros.substring(i)}`)
    }
}