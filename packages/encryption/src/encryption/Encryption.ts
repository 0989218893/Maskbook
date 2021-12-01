import type {
    PersonaIdentifier,
    ProfileIdentifier,
    TypedMessage,
    AESCryptoKey,
    PostIVIdentifier,
    EC_Public_CryptoKey,
    EC_Private_CryptoKey,
} from '@masknet/shared-base'

export interface EncryptOptions {
    /** Payload version to use. */
    version: -38 | -37
    /** Current author who started the encryption. */
    whoAmI: ProfileIdentifier | PersonaIdentifier
    /** The message to be encrypted. */
    message: TypedMessage
    /** Encryption target. */
    target: EncryptTargetPublic | EncryptTargetE2E
}
export interface EncryptTargetPublic {
    type: 'public'
}
export interface EncryptTargetE2E {
    type: 'E2E'
    target: (ProfileIdentifier | PersonaIdentifier)[]
}
export interface EncryptIO {
    queryLinkedPersona(profile: ProfileIdentifier): Promise<PersonaIdentifier | null>
    queryPublicKey(persona: PersonaIdentifier): Promise<EC_Public_CryptoKey | null>
    queryLocalKey(id: ProfileIdentifier | PersonaIdentifier): Promise<AESCryptoKey | null>
    queryPrivateKey(persona: PersonaIdentifier): Promise<EC_Private_CryptoKey | null>
    /**
     * Fill the arr with random values.
     * This should be only provided in the test environment to create a deterministic result.
     */
    getRandomValues?(arr: Uint8Array): Uint8Array
    /**
     * Generate a new AES Key.
     * This should be only provided in the test environment to create a deterministic result.
     */
    getRandomAESKey?(): Promise<AESCryptoKey>
    /**
     * Generate a pair of new EC key used for ECDH.
     * This should be only provided in the test environment to create a deterministic result.
     */
    getRandomECKey?(algr: 'ed25519' | 'P-256' | 'K-256'): Promise<[EC_Public_CryptoKey, EC_Private_CryptoKey]>
}
export interface EncryptResult {
    encryptedBy: AESCryptoKey
    output: string | Uint8Array
    identifier: PostIVIdentifier
    author: [ProfileIdentifier, PersonaIdentifier]
    target: EncryptTargetPublic | EncryptTargetE2E
}
export declare function encrypt(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult>
