export async function getPendingsLaundriesCount() {
    const response = await fetch(`/api/pendings-laundries/count`);

    if(!response.ok){
        console.error("Error during");
        return 0;
    }

    return response.count;
}