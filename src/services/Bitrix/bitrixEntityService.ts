// src/services/bitrix/bitrix-entity-service.ts

import axios from "axios";

/**
 * Creates a custom SPA entity for tour bookings in Bitrix24 if it doesn't already exist
 *
 * @param accessToken The Bitrix24 access token
 * @param apiEndpoint The Bitrix24 API endpoint URL
 * @param entityName The name for the custom entity
 * @returns The entity type ID of the created or existing entity
 */
export async function generateBitrixEntityIfNeeded(
  accessToken: string,
  apiEndpoint: string,
  entityName: string
): Promise<string> {
  try {
    console.log(`Checking if "${entityName}" entity already exists...`);

    // First, check if the entity already exists by listing all custom types
    const listResponse = await axios.post(`${apiEndpoint}crm.type.list`, {
      auth: accessToken,
    });

    // Look for an entity with the same name
    const existingEntity = listResponse.data.result.types.find(
      (type: any) => type.title === entityName || type.name === entityName
    );

    // If entity already exists, return its ID
    if (existingEntity) {
      console.log(
        `Entity "${entityName}" already exists with ID: ${existingEntity.entityTypeId}`
      );
      return existingEntity.entityTypeId;
    }

    // Otherwise, create the entity
    console.log(`Creating new entity "${entityName}"...`);

    // Create the custom SPA entity
    const createResponse = await axios.post(`${apiEndpoint}crm.type.add`, {
      auth: accessToken,
      fields: {
        NAME: entityName,
        TITLE: entityName,
        IS_USE_IN_USER_INTERFACE: "Y",
        IS_USE_IN_KANBAN: "N", // No pipeline/funnel view as requested
      },
    });

    if (!createResponse.data.result) {
      throw new Error(
        `Failed to create entity: ${JSON.stringify(createResponse.data)}`
      );
    }

    const entityTypeId = createResponse.data.result.entityTypeId;
    console.log(`Created entity "${entityName}" with ID: ${entityTypeId}`);

    // Add custom fields to the entity
    await addCustomFieldsToEntity(accessToken, apiEndpoint, entityTypeId);

    return entityTypeId;
  } catch (error) {
    console.error("Error creating Bitrix entity:", error);
    if (axios.isAxiosError(error)) {
      console.error("API Response:", error.response?.data);
    }
    throw new Error(
      `Failed to create Bitrix entity: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Adds the necessary custom fields to the tour booking entity
 */
async function addCustomFieldsToEntity(
  accessToken: string,
  apiEndpoint: string,
  entityTypeId: string
): Promise<void> {
  // Define all the fields we want to add
  const fields = [
    {
      field: "CONTACT_ID",
      title: "Contact",
      sort: 100,
      listLabel: "Contact",
      isRequired: true,
      multiple: false,
      type: "crm_entity",
      settings: {
        entityTypeName: "CRM_CONTACT",
      },
    },
    {
      field: "BOOKING_REFERENCE",
      title: "Booking Reference",
      sort: 200,
      listLabel: "Reference",
      isRequired: true,
      multiple: false,
      type: "string",
    },
    {
      field: "TOUR_DATE",
      title: "Tour Date",
      sort: 300,
      listLabel: "Date",
      isRequired: true,
      multiple: false,
      type: "datetime",
    },
    {
      field: "PRODUCT_NAME",
      title: "Tour Name",
      sort: 400,
      listLabel: "Tour",
      isRequired: true,
      multiple: false,
      type: "string",
    },
    {
      field: "GROUP_SIZE",
      title: "Number of Participants",
      sort: 500,
      listLabel: "Group Size",
      isRequired: false,
      multiple: false,
      type: "integer",
    },
    {
      field: "SUPPLIER_REFERENCE",
      title: "Supplier Reference",
      sort: 600,
      listLabel: "Supplier Ref",
      isRequired: false,
      multiple: false,
      type: "string",
    },
    {
      field: "BOOKING_STATUS",
      title: "Status",
      sort: 700,
      listLabel: "Status",
      isRequired: true,
      multiple: false,
      type: "enumeration",
      items: [
        { ID: "CONFIRMED", VALUE: "Confirmed" },
        { ID: "CANCELLED", VALUE: "Cancelled" },
        { ID: "COMPLETED", VALUE: "Completed" },
      ],
    },
    {
      field: "NOTES",
      title: "Notes",
      sort: 800,
      listLabel: "Notes",
      isRequired: false,
      multiple: false,
      type: "text",
    },
  ];

  // Add each field
  for (const fieldData of fields) {
    try {
      console.log(`Adding field "${fieldData.field}" to entity...`);

      await axios.post(`${apiEndpoint}crm.type.fields.add`, {
        auth: accessToken,
        entityTypeId: entityTypeId,
        fields: fieldData,
      });
    } catch (error) {
      console.error(`Error adding field "${fieldData.field}":`, error);
      if (axios.isAxiosError(error)) {
        // If field already exists, log and continue
        if (error.response?.data?.error === "FIELD_EXISTS") {
          console.log(`Field "${fieldData.field}" already exists, skipping.`);
          continue;
        }
        console.error("API Response:", error.response?.data);
      }
      throw error;
    }
  }

  console.log(`Added all fields to entity ${entityTypeId}`);
}
