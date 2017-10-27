namespace RideStylerShowcase {
    export interface RideStylerShowcaseAPIInitializeSettings{}
    export interface RideStylerShowcaseAPIInitializeSettingsKeyToken extends RideStylerShowcaseAPIInitializeSettings {
        token?:string;
        key?:string;
    }
    export interface RideStylerShowcaseAPIInitializeSettingsUser extends RideStylerShowcaseAPIInitializeSettings {
        username: string;
        password: string;
    }

    export namespace api {
        export function initialize(settings?:RideStylerShowcaseAPIInitializeSettingsKeyToken|RideStylerShowcaseAPIInitializeSettingsUser) {
            // If authentication information was passed in, let's use that
            if (settings) {
                if ('username' in settings && 'password' in settings) {
                    // Login using a username and password
                    settings = settings as RideStylerShowcaseAPIInitializeSettingsUser;

                    ridestyler.auth.start({
                        data: {
                            Username: settings.username,
                            Password: settings.password
                        },
                        callback: function(response) {
                            if (response.Success) authenticated.resolve();
                            else authenticated.reject();
                        }
                    });

                    // Skip calling validate below
                    return;
                } else if ('token' in settings || 'key' in settings) {
                    // Login using a key or token
                    ridestyler.auth.set(settings as RideStylerShowcaseAPIInitializeSettingsKeyToken);
                }
            }

            // Validate the user's key or token
            auth.validate()
                .done(() => authenticated.resolve())
                .fail(() => authenticated.reject());
        }

        export let authenticated = ridestyler.promise();
        export function isAuthenticated():boolean {
            return authenticated.state() === ridestyler.RideStylerPromiseState.Resolved;
        }
        export function afterAuthenticated(callback: Function) {
            if (isAuthenticated()) callback();
            else authenticated.done(() => callback());
        }

        export function request<Action extends keyof ridestyler.RidestylerAPIActionResponseMapping>(action:Action, data?:ridestyler.RidestylerAPIActionRequestMapping[Action]) : RideStylerPromise<ridestyler.RidestylerAPIActionResponseMapping[Action]> {
            type Response = ridestyler.RidestylerAPIActionResponseMapping[Action];
            var promise = ridestyler.promise<Response>();

            ridestyler.ajax.send<Action>({
                action: action,
                data: data,
                callback: function (response) {
                    if (response.Success) promise.resolve(response);
                    else promise.reject(response);
                }
            });

            return promise;
        }

        export function getURL<Action extends ridestyler.RideStylerAPIEndpoint>(action:Action, data?:ridestyler.RidestylerAPIActionRequestMapping[Action]) : string {
            return ridestyler.ajax.url(action, data);
        }
    }
}