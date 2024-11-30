const searchHistoryKey = 'searchHistory';
const searchResultKey = 'searchResult';
const curSearchCommandKey = 'curSearchCommand';
const curProcessInfoKey = 'curProcessInfo';

export const setSearchHistory = (value: any) => {
    localStorage.setItem(searchHistoryKey, JSON.stringify(value));
}

export const getSearchHistory = () => {
    return JSON.parse(localStorage.getItem(searchHistoryKey) ?? '[]');

}

export const setSearchResult = (value: any) => {
    localStorage.setItem(searchResultKey, JSON.stringify(value));
}

export const getSearchResult = () => {
    return JSON.parse(localStorage.getItem(searchResultKey) || '[]');
}

export const setCurSearchCommand = (value: string) => {
    localStorage.setItem(curSearchCommandKey, value);
}

export const getCurSearchCommand = () => {
    return localStorage.getItem(curSearchCommandKey) ?? '';
}

export const setCurProcessInfo = (value: any) => {
    localStorage.setItem(curProcessInfoKey, JSON.stringify(value));
}

export const getCurProcessInfo = () => {
    return JSON.parse(localStorage.getItem(curProcessInfoKey) || '{}');
}
