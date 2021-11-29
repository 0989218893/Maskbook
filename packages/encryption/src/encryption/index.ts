/*

Term:

    Local key:
        An AES key that never exported.
        It is connected to the Persona or the Profile.
        It is used to encrypt some message to themself to allow them to decrypt the message later.

Steps:

1. Convert TypedMessage to string (v38) or Uint8Array (v37).
2. Encrypt the message.
    2.1 Let _POST_KEY_ be a new AES key.
    2.2 Let _IV_ be a new IV.
    2.3 Encrypt the message with key and IV.
3. (E2E only) Make sure the author can decrypt this too:
    NOTE: We're reusing IV.
    3.1 Encrypt _POST_KEY_ with local key with the _IV_ (in step 2.2).
    3.2 This is the _ownersAESKeyEncrypted_ in the payload.
4. (Public only) Make sure everyone can decrypt this:
    (For v38):
        4.1 Encrypt _POST_KEY_ with hard coded AES key with the _IV_ (in step 2.2).
        4.2 This is the _ownersAESKeyEncrypted_ in the payload.
    (For v37):
        4.1 _POST_KEY_ is the _AESKey_ in the payload.
5. (E2E only) Encrypt to others by ECDH
    (For v38): Static ECDH
        5.1 For each of recipients
            5.1.1 Let _E_ be a new AES key derived from my EC private key and recipient's EC public key.
            !!! 5.1.2 Need review packages/mask/src/crypto/crypto-alpha-40.ts line 50-66.
            5.1.3 Encrypt _POST_KEY_ with _E_ and _IV_ in step 5.1.2
            5.1.4 Record the result above. This should be sent to them over gun.
    (For v37): Ephemeral ECDH
        5.1 For each of recipients
            5.1.1 Get Ephemeral EC key.
                NOTE: We reuse ephemeral within a single encryption process to reduce the payload size.
                NOTE: If A (K-256) encrypts to B, C (ed25519), and D (P-256)
                NOTE: There will be only 1 ed25519 and 1 P-256 ephemeral key pair will be generated.
                NOTE: If A append recipient of ed25519 in the future, it will have a new ed25519 ephemeral key.
                5.1.1.1 Let _curve_ be the curve of recipient's EC key.
                5.1.1.2 If there is an ephemeral key of _curve_ generated in the previous iteration, let _EPH_ be that key.
                5.1.1.3 Else, let _EPH_ be a new EC key pair in _curve_.
            5.1.2 Sign the _EPH_.[[PublicKey]] with my EC private key.
            5.1.3 Let _E_ be a new AES key derived from _EPH_.[[PrivateKey]] and recipient's EC public key.
            5.1.4 Let _IV_ be a random IV.
            5.1.5 Encrypt _POST_KEY_ with _E_ and _IV_ in step 5.1.2
            5.1.6 Record the result above. This should be sent to them over gun.
6. (E2E only) Publish them to the gun.

*/
import type {
    PersonaIdentifier,
    ProfileIdentifier,
    TypedMessage,
    AESCryptoKey,
    PostIVIdentifier,
} from '@masknet/shared-base'

//#region Encrypt
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
    // ! To be designed.
    // ! This interface should never touch the private key.
    // ! It should give this function an opaque object as the reference to the key.
    // queryLinkedPersona(profile: ProfileIdentifier): Promise<PersonaIdentifier | null>
    // queryPublicKey(persona: PersonaIdentifier): Promise<EC_Public_CryptoKey | null>
    // queryLocalKey(id: ProfileIdentifier | PersonaIdentifier): Promise<AESCryptoKey | null>
    // queryPrivateKey(persona: PersonaIdentifier): Promise<EC_Private_CryptoKey | null>
    // /**
    //  * Fill the arr with random values.
    //  * This should be only provided in the test environment to create a deterministic result.
    //  */
    // getRandomValues?(arr: Uint8Array): Uint8Array
    // /**
    //  * Generate a new AES Key.
    //  * This should be only provided in the test environment to create a deterministic result.
    //  */
    // getRandomAESKey?(): Promise<AESCryptoKey>
    // /**
    //  * Generate a pair of new EC key used for ECDH.
    //  * This should be only provided in the test environment to create a deterministic result.
    //  */
    // getRandomECKey?(algr: 'ed25519' | 'P-256' | 'K-256'): Promise<[EC_Public_CryptoKey, EC_Private_CryptoKey]>
}
export interface EncryptResult {
    encryptedBy: AESCryptoKey
    output: string | Uint8Array
    identifier: PostIVIdentifier
    author: [ProfileIdentifier, PersonaIdentifier]
    target: EncryptTargetPublic | EncryptTargetE2E
}
export declare function encrypt(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult>

//#endregion
