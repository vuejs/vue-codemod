import { ref, watch, SetupContext } from 'vue'

export function usePropsRef<T>(props: any, field: string, emit: SetupContext['emit']) {
  const r = ref<T>((props[field] as any) as T)

  watch(
    () => r.value,
    () => {
      if (r.value !== props[field]) {
        emit(`update:${field}`, r.value)
      }
    }
  )

  watch(
    () => props[field],
    () => {
      if (r.value !== props[field]) {
        r.value = props[field]
      }
    }
  )

  return r
}

export function getFixturePath(trans:string, fixture:string){
  return `transformations/__testfixtures__/${trans}/${fixture}`
}
