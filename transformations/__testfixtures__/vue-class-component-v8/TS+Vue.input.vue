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
import { BatchFile } from '@/utils/classes/UploadResults';
import { BUTTONS_ACTIONS, WARNING_MODALS, ROUTES } from '@/utils/consts';
import { eventBus } from '@/utils/eventBus';
import { Subscription } from 'rxjs';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Action, namespace } from 'vuex-class';
import { BATCH_PROCESSING_STATUSES, BatchStatus, SAMPLE_STATUSES } from '../consts/consts';
import { Filters } from '../models/UploadResultsSummaryState';
import { VIEWS_TABS_VALUES } from '../services/utils';

const uploadResultSummaryModule = namespace('uploadResultSummaryModule');
const plateRawDataModule = namespace('plateRawDataModule');
const patientDetailsModule = namespace('patientDetailsModule');
const reportsModule = namespace('reportsModule');
const uploadResultsModule = namespace('uploadResultsModule');
  

@Component({
  components: {
    IgcTitleLine: () => import('igentify-ui-core/lib/shared/components/IgcTitleLine/IgcTitleLine.vue'),
    rbTitle: () => import('@/components/rbTitle.vue'),
    IgnTitle: () => import('@/components/IgnTitle.vue'),
    SearchInput: () => import('@/components/SearchInput.vue'),
    ViewsTabs: () => import('@/components/ViewsTabs.vue'),
    MutationInfo: () => import('@/components/mutation-info/MutationInfo.vue'),
  },
})
export default class ActionableNotification extends Vue {
  @Watch('$route')
  onRouteChanged(route) {
    if (isLoginFlow(route.name))
      this.$refs.ignToastr.$refs.toastr.clearAll();
  }
  
  created() {
    var something: boolean;
    eventBus.$on('on-warning-modal-click', this.onWarningModalClick);
    configurePermissionRules();
    configureFeatureRules();
  }
  
  updated() {
    eventBus.$on('on-warning-modal-click', this.onWarningModalClick);
    configurePermissionRules();
    configureFeatureRules();
  }
  
  $refs: any;
  
  @State('loading') loading: boolean;
  @State('forceLoading') forceLoading: boolean;
  @State('message') message: unknown;
  @State('success') success: unknown;
  
  @Action('setMessage') setMessage: any;
  @Action('clearMessage') clearMessage: any;
  @Action('navigateTo') navigateTo: ({ name: string }) => void;
  
  @uploadResultSummaryModule.Action('realSaveSample') saveSample: (slimSample: SlimSample) => Promise<void>;
  @uploadResultSummaryModule.Action('doSomething') doSomething: (slimSample: SlimSample) => Promise<void>;
  @plateRawDataModule.Action('addPatient') addPatient: (slimSample: SlimSample) => Promise<void>;
 
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
    var something;
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
