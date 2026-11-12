console.log('Hello TypeScript!')

const enum Flippable {
  Burger,
  Chair,
  Cup,
  Skateboard,
  Table
}


let greet2 = function(name: string) {
    return 'hello' + name
}

let greet3 = (name: string) => {
    return 'hello ' + name
}

let numbers = {
  *[Symbol.iterator]() {
    for (let n = 1; n <= 10; n++) {
      yield n
    }
  }
}

for (let a of numbers) {
  console.log(a)
}

function times(f: (index: number) => void, n: number) {
    for(let i = 0; i < n; i++)
        f(i)
}

times(n => console.log(n), 4)

type Filter = {
    <T>(array:T[], f: (item: T) => boolean): T[]
}


let filter: Filter = (array, f) => {
    let result = []
    for (let item of array) {
        if (f(item)) {
            result.push(item)
        }
    }
    return result
}

let result = filter([1, 2, 3], _ => _ > 2)
console.log(result)
 class Point {
    constructor(public x: number, public y = 0) {}
    getX(): number {
      return this.x
    }
 }

 class Set {
  has(value: number): boolean {
    // ...
  }
  add(value: number): Set {
    // ...
  }
}