export async function getPendingAccounts(page, limit){
    const response = await fetch(`/api/pending-professionnal-accounts?page=${page}&limit=${limit}`);

    if(!response.ok){
        throw new Error("Error during");
    }

    return await response.json();
}

export async function getPendingAccountsCount(){
    const response = await fetch(`/api/pending-professionnal-accounts/count`);

    if(!response.ok){
        throw new Error("Error during");
    }

    const data = await response.json();

    return data.count;
}