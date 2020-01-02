import { GdprGuard, GdprGuardRaw } from "./GdprGuard"
import { GdprStorage } from "./GdprStorage"
import { GdprGuardCollection } from "./GdprGuardCollection"

interface GdprGuardGroupRaw extends GdprGuardRaw{
    guards: GdprGuardRaw[],
}

class GdprGuardGroup implements GdprGuardCollection {
    protected bindings: Map<string, GdprGuard> = new Map();
    public readonly storage: GdprStorage = GdprStorage.None;

    constructor(public name: string, public description: string = "", public enabled: boolean = false){
    }

    static for(name: string, description: string = ""): GdprGuardGroup{
        return new GdprGuardGroup(name, description);
    }

    addGuard(guard: GdprGuard): GdprGuardGroup{
        this.bindings.set(guard.name, guard);
        return this;
    }

    hasGuard(name: string): boolean{
        return this.bindings.has(name);
    }

    getGuard(name: string): GdprGuard | null{
        return this.bindings.get(name) || null;
    }

    protected doForEachGuard(cb: (guard: GdprGuard) => any): GdprGuardGroup{
        this.bindings.forEach(guard => cb(guard));
        return this;
    }

    isEnabled(name: string): boolean{
        if(this.hasGuard(name)){
            const guard = this.getGuard(name);
            if(guard !== null){
                return (<GdprGuard>guard).enabled;
            }
        }

        for(const [_, guard] of this.bindings){
            if(guard.isEnabled(name))
                return true;
        }

        return false;
    }

    enable(): GdprGuardGroup{
        return this.doForEachGuard(guard => guard.enable());
    }

    disable(): GdprGuardGroup{
        return this.doForEachGuard(guard => guard.disable());
    }

    toggle(): GdprGuardGroup{
        return this.enabled ? this.disable() : this.enable();
    }

    enableForStorage(type: GdprStorage): GdprGuardGroup{
        return this.doForEachGuard(guard => {
            if(guard.storage & type)
                guard.enable();
        });
    }

    disableForStorage(type: GdprStorage): GdprGuardGroup{
        return this.doForEachGuard(guard => {
            if(guard.storage & type)
                guard.disable();
        });
    }

    toggleForStorage(type: GdprStorage): GdprGuardGroup{
        return this.doForEachGuard(guard => {
            if(guard.storage & type)
                return guard.toggle();
        });
    }

    raw(): GdprGuardGroupRaw{
        const ret: GdprGuardGroupRaw = {
            name: this.name,
            description: this.description,
            enabled: this.enabled,
            storage: this.storage,
            guards: [],
        };

        ret.guards = [...this.bindings].map(([_, guard]) => guard.raw() as GdprGuardRaw);

        return ret;
    }
}

export {
    GdprGuardGroup,
    GdprGuardGroupRaw,
}