import * as crypto from 'crypto';

//Encrypt entered credentails like API keys for sources and destinations. 
//Allow encrypted creadentials to be stored in the database.
//Allow encrypted credentials to be decrypted for use in the application.
function getMasterKey()
{
    const keyHex = process.env.MASTER_KEY;
    if(!keyHex)
    {
        throw new Error("Master key not found");
    }

    return Buffer.from(keyHex, 'hex');
}

function encryptCredential(textToEncrypt: string)
{
    const key = getMasterKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get the authentication tag
    const authTag = cipher.getAuthTag().toString('hex');

      // Return everything needed for decryption
    return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
    algorithm: 'aes-256-gcm'
    };
}

// Example decryption function
function decryptCredential(encryptedObj : any) 
{
    const masterKey = getMasterKey();
    

    
    // Convert hex values back to Buffers
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const authTag = Buffer.from(encryptedObj.authTag, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

// Convert encryption object to storable string
function prepareForStorage(encryptedObj : any) {
    return JSON.stringify(encryptedObj);
}

  // Parse from storage
function parseFromStorage(storedString : string ) {
    return JSON.stringify(storedString);
}


