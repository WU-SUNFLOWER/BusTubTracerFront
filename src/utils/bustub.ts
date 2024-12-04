export const rawTableToElTableData = (table: any[][]) => {

    if (!table || table.length === 0) {
        return [];
    }

    const headers = table[0];
    const data = table.slice(1).map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });

    const result = { headers, data };
    return result;
};

export const queryResultToElTableData = (result: any) => {
    const headers = result.data.column_names;
    const tuples = result.data.tuples;
    const data = tuples.map((tuple: any) => {
        let cols = tuple.columns;
        let obj: any = { rid: tuple.rid };
        headers.forEach((header: string, index: number) => {
            obj[header] = cols[index];
        });
        return obj;
    });
    return { headers, data, table_name: result.data.table_name, table_oid: result.data.table_oid, };
};