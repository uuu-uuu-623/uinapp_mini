// 有关于 地区选择器的数据封装
import { useCascaderAreaData } from '@vant/area-data'

// 地区数据是静态的 所以只生成一次
// 缓存后只生成一次
let cachedAreaList: any[] | null = null

export const useAreaData = () => {
  if (cachedAreaList) return cachedAreaList
  const areaDatas = useCascaderAreaData()
  cachedAreaList = areaDatas
  return areaDatas
}
