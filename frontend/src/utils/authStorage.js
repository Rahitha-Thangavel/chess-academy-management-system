const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

const storage = {
    get(key) {
        return sessionStorage.getItem(key);
    },
    set(key, value) {
        sessionStorage.setItem(key, value);
    },
    remove(key) {
        sessionStorage.removeItem(key);
    },
};

export const authStorage = {
    keys: {
        access: ACCESS_TOKEN_KEY,
        refresh: REFRESH_TOKEN_KEY,
        user: USER_KEY,
    },

    migrateFromLocalStorage() {
        const access = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
        const user = localStorage.getItem(USER_KEY);

        if (access && !storage.get(ACCESS_TOKEN_KEY)) {
            storage.set(ACCESS_TOKEN_KEY, access);
        }
        if (refresh && !storage.get(REFRESH_TOKEN_KEY)) {
            storage.set(REFRESH_TOKEN_KEY, refresh);
        }
        if (user && !storage.get(USER_KEY)) {
            storage.set(USER_KEY, user);
        }

        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    getAccessToken() {
        return storage.get(ACCESS_TOKEN_KEY);
    },

    getRefreshToken() {
        return storage.get(REFRESH_TOKEN_KEY);
    },

    getUser() {
        return storage.get(USER_KEY);
    },

    setSession({ access, refresh, user }) {
        if (access) storage.set(ACCESS_TOKEN_KEY, access);
        if (refresh) storage.set(REFRESH_TOKEN_KEY, refresh);
        if (user) storage.set(USER_KEY, JSON.stringify(user));
    },

    clearSession() {
        storage.remove(ACCESS_TOKEN_KEY);
        storage.remove(REFRESH_TOKEN_KEY);
        storage.remove(USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
