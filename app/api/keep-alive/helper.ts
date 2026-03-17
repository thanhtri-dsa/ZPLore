import { SupabaseClient } from '@supabase/supabase-js'
import { keepAliveConfig as config } from '@/config/keep-alive-config'

export type QueryResponse = {
    successful: boolean
    message: string
}

export type QueryResponseWithData = QueryResponse & {
    data: unknown[] | null
}

const defaultRandomStringLength: number = 12

const alphabetOffset: number = 'a'.charCodeAt(0)
export const generateRandomString = (length: number = defaultRandomStringLength) => {
    let newString = ''

    for (let i = 0; i < length; i++) {
        newString += String.fromCharCode(alphabetOffset + Math.floor(Math.random() * 26))
    }

    return newString
}

export const retrieveEntries = async (supabase: SupabaseClient): Promise<QueryResponseWithData> => {
    const { data, error } = await supabase
        .from(config.table)
        .select(config.column)

    const messageInfo: string = `Results for retrieving entries from '${config.table}' - '${config.column}' column`

    if (error) {
        const errorInfo = `${messageInfo}: ${error.message}`
        if (config.consoleLogOnError) console.log(errorInfo)
        return {
            successful: false,
            message: errorInfo,
            data: null,
        }
    }

    return {
        successful: true,
        message: `${messageInfo}: ${JSON.stringify(data)}`,
        data: data as unknown[] | null,
    }
}

export const insertRandom = async (supabase: SupabaseClient, randomString: string): Promise<QueryResponse> => {
    const upsertData = {
        [config.column]: randomString,
    }

    const { data, error } = await supabase
        .from(config.table)
        .upsert(upsertData)
        .select()

    const messageInfo: string = `Results for upserting '${randomString}' into '${config.table}' at column '${config.column}'`

    if (error) {
        const errorInfo = `${messageInfo}: ${error.message}`
        if (config.consoleLogOnError) console.log(errorInfo)
        return {
            successful: false,
            message: errorInfo
        }
    }

    return {
        successful: true,
        message: `${messageInfo}: ${JSON.stringify(data)}`
    }
}

export const deleteRandom = async (supabase: SupabaseClient, entryToDelete: string): Promise<QueryResponse> => {
    const { error } = await supabase
        .from(config.table)
        .delete()
        .eq(config.column, entryToDelete)

    const messageInfo: string = `Results for deleting '${entryToDelete}' from '${config.table}' at column '${config.column}'`

    if (error) {
        const errorInfo = `${messageInfo}: ${error.message}`
        if (config.consoleLogOnError) console.log(errorInfo)
        return {
            successful: false,
            message: errorInfo
        }
    }

    return {
        successful: true,
        message: `${messageInfo}: success`
    }
}

export const determineAction = async (supabase: SupabaseClient): Promise<QueryResponse> => {
    const retrievalResults: QueryResponseWithData = await retrieveEntries(supabase)

    if (!retrievalResults.successful) {
        return {
            successful: false,
            message: `Failed to retrieve entries from ${config.table}\n${retrievalResults.message}`
        }
    } else {
        const retrievedEntries = retrievalResults.data
        if (retrievedEntries == null) {
            return {
                successful: false,
                message: `Received 'null' data result when retrieving entries from ${config.table}\n${retrievalResults.message}`
            }
        } else {
            let responseMessage = `${retrievalResults.message}\n\n`
            let responseSuccessful: boolean = true

            if (retrievedEntries.length > config.sizeBeforeDeletions) {
                const entryToDelete = retrievedEntries.pop() as Record<string, string>
                const deletionResults: QueryResponse = await deleteRandom(supabase, entryToDelete[config.column])

                responseSuccessful = deletionResults.successful
                responseMessage += deletionResults.message
            } else {
                const currentRandomString = generateRandomString()
                const insertResults: QueryResponse = await insertRandom(supabase, currentRandomString)

                responseSuccessful = insertResults.successful
                responseMessage += insertResults.message
            }

            return {
                message: responseMessage,
                successful: responseSuccessful,
            }
        }
    }
}
