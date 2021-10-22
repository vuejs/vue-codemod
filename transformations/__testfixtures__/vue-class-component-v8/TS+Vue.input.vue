<template>
  <div
    :style="{ color: props.color, background: props.background }"
    class="actionable-notification"
  >
    <div class="notification-icon">
      <div
        v-if="counter"
        class="counter"
      >
        {{ counter }}
      </div>
      <span :class="[props.notificationIcon]" />
    </div>
    <div class="notification">
      <v-clamp
        autoresize
        :max-lines="3"
      >
        {{ message }}
      </v-clamp>
    </div>
    <div class="action-icon">
      <span
        v-tooltip="actionTooltip"
        :class="[props.actionIcon]"
        @click="$emit('click')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  ActionProps,
  ActionType,
  NotificationType,
  NotifictionProps,
} from '@/components/actionableNotification/consts';
  import * as something from '@/consts';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import VClamp from 'vue-clamp';
import { namespace } from 'vuex-class';
  
  const a = {
   ...mapActions('addSampleModule', ['realSaveSample']),
  //b: 1,
}
  
//var abc = 1;
//const addSampleModule1 = namespace('addSampleModule');
//let removeSampleModule2 = namespace('removeSampleModule');
  

  
@Component
export default class ActionableNotification extends Vue {
  @addSampleModule.Action('realSaveSample') saveSample: (slimSample: SlimSample) => Promise<void>;
  @addSampleModule.Action('doSomething') doSomething: (slimSample: SlimSample) => Promise<void>;
  @addPatientModule.Action('addPatient') addPatient: (slimSample: SlimSample) => Promise<void>;
 
  @uploadResultSummaryModule.State('data') currentData: any;
  @uploadResultSummaryModule.State('incomingSampleStatuses') incomingSampleStatuses: any;
  @uploadResultSummaryModule.State('search') search!: string;
  @uploadResultSummaryModule.State('filters') filters!: Filters;
  @uploadResultSummaryModule.State('data') data!: Array<any>;
  @plateRawDataModule.State('plateRawData') plateRawData!: any;
  @patientDetailsModule.State('mutationInfoResult') mutationInfoResult!: any;
  @uploadResultsModule.State('selectedSuccefulBatchFile') selectedSuccefulBatchFile!: BatchFile;
  @uploadResultsModule.Getter('versions') versions: Record<string, string>;
  @uploadResultSummaryModule.State('pollSubscription') pollSubscription!: Subscription | null;
  @uploadResultsModule.Action('initState') initState: () => void;
  @uploadResultSummaryModule.Getter('disabledButtons') disabledButtons: boolean;
  @uploadResultSummaryModule.Getter('batchStatus') batchStatus: BatchStatus;
  @uploadResultSummaryModule.Action('handleReviewedFiltering') handleReviewedFiltering: any;
  @uploadResultSummaryModule.Action('clearSearchReviewedFiltering') clearSearchReviewedFiltering: any;
  @uploadResultSummaryModule.Action('updateSearch') updateSearch: any;
  @uploadResultSummaryModule.Action('handleManualSearch') handleManualSearch: any;
  @uploadResultSummaryModule.Action('setBatchId') setBatchId: any;
  @uploadResultSummaryModule.Action('discardData') discardData: any;
  @uploadResultSummaryModule.Action('saveData') saveFile: any;
  @uploadResultSummaryModule.Action('updateMutationInfo') updateMutationInfo: any;
  @uploadResultSummaryModule.Action('downloadExportedCSV') downloadExportedCSV: (any) => void;
  @uploadResultSummaryModule.Action('updateData') updateData: () => void;
  @patientDetailsModule.Action('clearMutationInfoResult')
  clearMutationInfoResult: any;
  
  @Prop() message?: string;
  @Prop({ default: () => NotificationType.INFO }) notificationType: NotificationType;
  @Prop() actionType: ActionType;
  @Prop() counter: number;
  @Prop() actionTooltip: string;
  
  get someProp() {
    var something: any[] = [1];
    // const vm: Vue | null = null;
    return { ...NotifictionProps[this.notificationType], ...ActionProps[this.notificationType] };
  }
  
  hello() {
    console.log('Hello');
  }
}
</script>

<style
  scoped
  lang="less"
>
@import '../../../../public/less/style';

.actionable-notification {
  width:         100%;
  height:        100%;
  border-radius: 3px;
  display:       flex;
  padding:       16px 8px;
  font-weight:   500;


  .notification-icon, .action-icon {
    display:     flex;
    align-items: center;
    width:       45px;
  }

  .notification-icon {
    font-size:       30px;
    justify-content: flex-start;
    position:        relative;

    .counter {
      position:         absolute;
      background-color: @error;
      color:            #fff;
      border-radius:    50%;
      font-size:        10px;
      width:            20px;
      height:           20px;
      display:          flex;
      justify-content:  center;
      align-items:      center;
      top:              5px;
      left:             -2px;
    }
  }

  .action-icon {
    font-size:       20px;
    justify-content: flex-end;

    span {
      cursor: pointer;
    }
  }

  .notification {
    width:         calc(100% - 90px);
    font-size:     12px;
    overflow:      hidden;
    text-overflow: ellipsis;
    align-self:    center;
  }
}

</style>
