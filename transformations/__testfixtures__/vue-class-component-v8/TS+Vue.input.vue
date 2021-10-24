<template>
  <div>
    FAKE
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { Emit, Prop } from 'vue-property-decorator';
import TestComponent1 from './TestComponent1/TestComponent1.vue';
import TestComponent2 from './TestComponent2/TestComponent2.vue';
import { FileUpload } from '../../shared/types/FileUpload';

@Component({
  components: {
    TestComponent1,
    TestComponent2,
  },
})
export default class TestComponent extends Vue {
  @Prop({ default: () => [] }) fileList!: FileUpload[];

  @Prop() content!: any;

  @Prop() questionKey!: string;

  @Prop() fileTitle!: string;

  @Prop() uploadPending!: boolean;

  @Prop() removalPending!: boolean;

  @Prop({ default: 0 }) uploadProgress!: number;

  @Emit()
  onUpload(fileList: File[]) {
    return this.questionKey;
  }

  @Emit()
  onRemove(fileList: FileUpload[]) {
  }

  get hasFiles(): boolean {
    return !!this.fileList.length;
  }
}
</script>

