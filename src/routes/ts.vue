<template>
  <private-view title="Types for TypeScript">
    <template #navigation>
      <NavbarComponent />
    </template>
    <template #title-outer:prepend>
      <div v-html="languages['ts'].logo" />
    </template>
    <div class="page">
      <CodeComponent :value="types" language="typescript" downloadName="types.ts" :loading="loading" />
      <div class="div">
        <p>
          To use these types with the <code>@directus/sdk</code>, include the
          <code>types.ts</code> like this:
        </p>
        <CodeComponent :value="exampleCode()" language="typescript" />
        <h3 class="type-title">Options</h3>
        <v-checkbox v-model="useInterface" @click="generateTypes">
          <span>
            Use Interface instead of Type
          </span>
        </v-checkbox>
        <v-checkbox v-model="useIntersectionTypes" @click="generateTypes">
          <span>
            Use Intersection Types (<code>&</code>) instead of Union Types
            (<code>|</code>) for relational fields.
            <a href="https://github.com/maltejur/directus-extension-generate-types/pull/3#issuecomment-1037243032">
              Learn more
            </a>
          </span>
        </v-checkbox>
        <v-checkbox v-model="sdk11" @click="generateTypes">
          <span>
            Generate Types for Directus SDK >= v11
          </span>
        </v-checkbox>
      </div>
    </div>
  </private-view>
</template>

<script lang="ts">
import NavbarComponent from "../components/navigation.vue";
import CodeComponent from "../components/code.vue";
import generateTsTypes from "../lib/generateTypes/ts";
import languages from "../lib/languages";

export default {
  components: { NavbarComponent, CodeComponent },
  inject: ["api"],
  data() {
    const useInterface = localStorage.getItem(
      "directus-extension-generate-types-use-interface"
    ) !== "false";
    const useIntersectionTypes = localStorage.getItem(
      "directus-extension-generate-types-use-intersection-types"
    ) === "true";
    const sdk11 = localStorage.getItem(
      "directus-extension-generate-types-sdk11"
    ) !== "false";
    return {
      types: "",
      languages,
      useInterface,
      useIntersectionTypes,
      sdk11,
      loading: false,
    };
  },
  methods: {
    generateTypes() {
      console.log(window.localStorage);
      localStorage.setItem(
        "directus-extension-generate-types-use-interface",
        this.useInterface
      );
      localStorage.setItem(
        "directus-extension-generate-types-use-intersection-types",
        this.useIntersectionTypes
      );
      localStorage.setItem(
        "directus-extension-generate-types-sdk11",
        this.sdk11
      );
      generateTsTypes(this.api, this.useInterface, this.useIntersectionTypes, this.sdk11).then((types) => {
        this.types = types;
        this.loading = false;
      });
    },
    exampleCode() {
      return this.sdk11 ? `import { createDirectus } from "@directus/sdk";
import { rest } from "@directus/sdk/rest";
import { CustomDirectusTypes } from "./types";

const client = createDirectus<CustomDirectusTypes>("<directus url>").with(rest());` : `import { Directus } from "@directus/sdk";
import { CustomDirectusTypes } from "./types";

const directus = new Directus<CustomDirectusTypes>("<directus url>");`
    }
  },
  mounted() {
    this.generateTypes();
  },
};
</script>

<style scoped>
.page {
  padding: 0 var(--content-padding);
  display: flex;
}

@media (max-width: 1500px) {
  .page {
    flex-direction: column;
  }
}

code {
  background-color: rgba(0, 0, 0, 0.05);
  font-size: 0.9em;
  padding: 3px;
  border-radius: 4px;
}

.type-title {
  margin: 10px 0;
}

a {
  color: var(--primary-110);
  font-weight: 500;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
