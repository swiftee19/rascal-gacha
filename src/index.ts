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
    makeRascal: update([text], Rascal, (rascalName) => {
        const newStrategy: Rascal = {
            id: uuidv4(),
            name: rascalName,
            health: BigInt(Math.floor(Math.random() * (151 - 100)) + 100),
            attack: BigInt(Math.floor(Math.random() * (31 - 10)) + 10),
            speed: BigInt(Math.floor(Math.random() * (11 - 5)) + 5)
        }

        rascals.insert(newStrategy.id, newStrategy);

        return newStrategy;
    }),

    getAllRacals: query([], Vec(Rascal), () => {
        return rascals.values();
    }),

    getRandomRascal: update([], Rascal, async  () => {
        const rascalArray: Rascal[] = [...rascals.values()];
        const rng = await ic.call(managementCanister.raw_rand);
        const randomIndex = Math.floor(rng[0] % rascalArray.length);
        return rascalArray[randomIndex];
    }),
})
