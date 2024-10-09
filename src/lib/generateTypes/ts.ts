import { Field } from "lib/types";
import { getCollections } from "../api";

export default async function generateTsTypes(
  api,
  useInterface = true,
  useIntersectionTypes = false,
  sdk11 = true
) {
  const collections = await getCollections(api);
  let ret = "";
  const types = [];

  Object.values(collections).forEach((collection) => {
    const collectionName = collection.collection;
    const typeName = pascalCase(collectionName);
    const isSingleton = collection.meta?.singleton === true;
    types.push(
      sdk11
        ? `${collectionName}: ${typeName}${isSingleton ? "" : "[]"}`
        : `${collectionName}: ${typeName}`
    );
    ret += useInterface ? `export interface ${typeName} {\n` : `export type ${typeName} = {\n`;
    collection.fields.forEach((field) => {
      if (field.meta?.interface?.startsWith("presentation-")) return;
      ret += "  ";
      ret += field.field.includes("-") ? `"${field.field}"` : field.field;
      // if (field.schema?.is_nullable) ret += "?";
      ret += ": ";
      ret += getType(field, useIntersectionTypes);
      ret += useInterface ? '\n' : ";\n";
    });
    ret += useInterface? '}\n\n' : "};\n\n";
  });

  ret += (useInterface ?
      'export interface CustomDirectusTypes {\n'
      : "export type CustomDirectusTypes = {\n")
      + types.map((x) => useInterface ? `  ${x}` : `  ${x};`).join("\n") +
    (useInterface ? '\n}' : "\n};");

  ret += "\n";

  return ret;
}

function pascalCase(str: string) {
  return str
    .split(" ")
    .flatMap((x) => x.split("_"))
    .flatMap((y) => y.split("-"))
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join("");
}

function getType(field: Field, useIntersectionTypes = false) {
  let type: string;
  if (field.relation && field.relation.type === "many") {
    type = "";
  } else {
    if (["integer", "bigInteger", "float", "decimal"].includes(field.type))
      type = "number";
    else if (["boolean"].includes(field.type)) type = "boolean";
    else if (["json"].includes(field.type)) type = "JsonValue";
    else if (["csv"].includes(field.type)) type = "string[]";
    else type = "string";
  }
  if (field.relation) {
    type += type !== "" ? (useIntersectionTypes ? " & " : " | ") : "";
    type += field.relation.collection
      ? pascalCase(field.relation.collection)
      : "any";
    if (field.relation.type === "many") type += "[]";
  }
  // if (field.schema?.is_nullable) {
  //   if (field.relation && useIntersectionTypes) {
  //     type = `(${type}) | null`;
  //   } else {
  //     type += ` | null`;
  //   }
  // }
  return type;
}
