import { Canister, Opt, Record, Result, StableBTreeMap, Vec, nat, query, text, update } from 'azle';
import { v4 as uuidv4 } from 'uuid';
import { blob, ic } from 'azle';
import { managementCanister } from 'azle/canisters/management';

const Rascal = Record({
    id : text,
    name: text,
    health : nat,
    attack : nat,
    speed : nat
});

type Rascal = typeof Rascal.tsType;

const rascals = StableBTreeMap<text, Rascal>(0);

export default Canister({
    // Creates a new Rascal with random health, attack, and speed values
    makeRascal: update([text], Result(Rascal, text), (rascalName) => {
        const newRascal: Rascal = {
            id: uuidv4(),
            name: rascalName,
            health: BigInt(Math.floor(Math.random() * (151 - 100)) + 100),
            attack: BigInt(Math.floor(Math.random() * (31 - 10)) + 10),
            speed: BigInt(Math.floor(Math.random() * (11 - 5)) + 5)
        }

        rascals.insert(newRascal.id, newRascal);

        return Ok(newRascal);
    }),

    // Retrieves all Rascals
    getAllRascals: query([], Vec(Rascal), () => {
        return rascals.values();
    }),

    // Retrieves a random Rascal
    getRandomRascal: update([], Result(Rascal, text), async  () => {
        const rascalArray: Rascal[] = [...rascals.values()];
        if (rascalArray.length === 0) {
            return Err("No rascals available");
        }
        const rng = await ic.call(managementCanister.raw_rand);
        const randomIndex = Math.floor(rng[0] % rascalArray.length);
        return Ok(rascalArray[randomIndex]);
    }),
});
