<template>
  <div class="material-request-container">
    <van-nav-bar title="物资申领" left-text="返回" @click-left="goBack">
      <template #title>
        <div style="display: flex; align-items: center;">
          <van-icon name="gift-o" style="margin-right: 8px;" />
          物资申领
        </div>
      </template>
    </van-nav-bar>
    
    <van-tabs v-model="activeTab">
      <van-tab title="申领物资">
        <van-form @submit="onSubmit">
          <van-field
            v-model="form.material_name"
            name="material_id"
            placeholder="请选择物资"
            label="物资名称"
            required
            readonly
            clickable
            @click="showMaterialPicker = true"
            :rules="[{ required: true, message: '请选择物资' }]"
          />
          
          <!-- 物资分类选择器 -->
          <van-field
            v-model="form.category"
            name="category"
            label="物资分类"
            readonly
            clickable
            @click="showCategoryPicker = true"
            :rules="[{ required: true, message: '请选择物资分类' }]"
          >
            <template #input>
              <van-tag :type="form.category === 'production' ? 'primary' : 'success'">
                {{ form.category === 'production' ? '生产性物资' : '非生产性物资' }}
              </van-tag>
            </template>
          </van-field>
          
          <!-- 物资分类选择弹窗 -->
          <van-popup
            v-model="showCategoryPicker"
            position="bottom"
            round
          >
            <div class="picker-container">
              <div class="picker-header">
                <van-button type="default" size="small" @click="showCategoryPicker = false">取消</van-button>
                <span class="picker-title">请选择物资分类</span>
                <van-button type="primary" size="small" @click="confirmCategorySelection">确定</van-button>
              </div>
              <van-picker
                ref="categoryPicker"
                :columns="categoryOptions"
                @change="onCategoryChange"
              />
            </div>
          </van-popup>
          
          <!-- 物资选择器 -->
          <van-popup
            v-model="showMaterialPicker"
            position="bottom"
            round
            :style="{ height: '80%' }"
          >
            <div class="picker-header">
              <div class="picker-title">选择物资</div>
              <van-button @click="showMaterialPicker = false" type="default" size="small">关闭</van-button>
            </div>
            <van-cell-group>
              <van-cell
                v-for="(material, index) in materialList"
                :key="material.id"
                :title="material.name"
                :value="`${material.unit} - 当前库存: ${material.stock_quantity}`"
                @click="selectMaterial(material, index)"
                :clickable="true"
              >
                <template #label>
                  <span style="font-size: 12px; color: #666;">
                    分类：{{ material.category === 'production' ? '生产性物资' : '非生产性物资' }}
                  </span>
                </template>
              </van-cell>
            </van-cell-group>
          </van-popup>
          <van-field
            v-model="form.request_quantity"
            name="request_quantity"
            type="number"
            placeholder="请输入申领数量"
            label="申领数量"
            required
            :rules="[{ required: true, message: '请输入申领数量' }]"
          />
          
          <!-- 照片上传 -->
          <van-field label="相关照片" name="photos">
            <template #input>
              <div class="upload-container">
                <van-uploader
                  v-model="form.photos"
                  :after-read="onPhotosRead"
                  :before-delete="onPhotoDelete"
                  :max-count="5"
                  :max-size="5 * 1024 * 1024"
                  accept="image/*"
                  @oversize="onOversize"
                >
                  <van-button type="default" size="small" icon="photograph">
                    上传照片
                  </van-button>
                </van-uploader>
              </div>
            </template>
          </van-field>
          
          <!-- 附件上传 -->
          <van-field label="相关附件" name="attachments">
            <template #input>
              <div class="upload-container">
                <van-uploader
                  v-model="form.attachments"
                  :after-read="onAttachmentsRead"
                  :before-delete="onAttachmentDelete"
                  :max-count="3"
                  :max-size="10 * 1024 * 1024"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  @oversize="onAttachmentOversize"
                >
                  <van-button type="default" size="small" icon="description">
                    上传附件
                  </van-button>
                </van-uploader>
              </div>
            </template>
          </van-field>
          
          <div style="margin: 24px;">
            <van-button type="primary" block native-type="submit" :loading="loading">
              提交申领
            </van-button>
          </div>
        </van-form>
      </van-tab>
      <van-tab title="我的申领">
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
          :immediate-check="false"
        >
          <van-cell
            v-for="item in materialRequests"
            :key="item.id"
            :title="`物资：${item.Material?.name}`"
            :value="`状态：${getStatusText(item.status)}`"
          >
            <template #label>
              <div>
                <div>{{ `物资：${item.Material?.name}` }}</div>
                <div style="font-size: 12px; color: #999;">
                  {{ `数量：${item.request_quantity}${item.Material?.unit || ''}` }}
                </div>
              </div>
            </template>
            <template #right-icon>
              <van-tag :type="getStatusType(item.status)">
                {{ getStatusText(item.status) }}
              </van-tag>
            </template>
          </van-cell>
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { requestMaterial, getMaterialRequests, getMaterials } from '../api/material'
import { Toast, Icon } from 'vant'

export default {
  name: 'MaterialRequest',
  components: {
    Icon
  },
  data() {
    return {
      activeTab: 0,
      form: {
        material_id: '',
        material_name: '',
        request_quantity: '',
        category: 'production', // 默认是生产性物资
        photos: [], // 照片文件数组
        attachments: [] // 附件文件数组
      },
      materialRequests: [],
      loading: false,
      finished: false,
      page: 1,
      // 物资选择相关
      showMaterialPicker: false,
      selectedMaterialIndex: 0,
      materialList: [],
      materialColumns: [],
      // 物资分类选择相关
      showCategoryPicker: false,
      categoryOptions: [
        { text: '生产性物资', value: 'production' },
        { text: '非生产性物资', value: 'non_production' }
      ],
      selectedCategoryIndex: 0
    }
  },
  mounted() {
    if (this.activeTab === 1) {
      this.onLoad()
    } else {
      this.loadMaterialList()
    }
  },
  methods: {
    async loadMaterialList() {
      try {
        // 根据选择的物资分类加载相应的物资列表
        const response = await getMaterials({ category: this.form.category })
        this.materialList = response.data
        this.materialColumns = this.materialList.map(item => `${item.name} (${item.unit}) - 当前库存: ${item.stock_quantity}`)
      } catch (error) {
        console.error('加载物资列表失败:', error)
        Toast.fail('加载物资列表失败')
      }
    },
    
    onMaterialConfirm(value, index) {
      if (this.materialList.length > 0 && typeof index === 'number') {
        const selectedMaterial = this.materialList[index]
        this.form.material_id = selectedMaterial.id
        this.form.material_name = selectedMaterial.name
      }
      this.showMaterialPicker = false
    },
    
    selectMaterial(material, index) {
      this.form.material_id = material.id
      this.form.material_name = material.name
      this.showMaterialPicker = false
    },
    
    // 物资分类选择器确认事件
    onCategoryConfirm(value, index) {
      this.form.category = value.value
      this.form.material_id = '' // 重置物资选择
      this.form.material_name = ''
      this.showCategoryPicker = false
      // 重新加载物资列表
      this.loadMaterialList()
    },
    
    // 物资分类变化事件
    onCategoryChange(picker, value, index) {
      this.selectedCategoryIndex = index
    },
    
    // 确认分类选择
    confirmCategorySelection() {
      const selectedOption = this.categoryOptions[this.selectedCategoryIndex]
      this.form.category = selectedOption.value
      this.form.material_id = '' // 重置物资选择
      this.form.material_name = ''
      this.showCategoryPicker = false
      // 重新加载物资列表
      this.loadMaterialList()
    },
    
    async onSubmit(values) {
      try {
        this.loading = true
        
        // 先上传照片和附件
        const photoUrls = await this.uploadFiles(this.form.photos, 'photo')
        const attachmentUrls = await this.uploadFiles(this.form.attachments, 'attachment')
        
        // 提交申领
        await requestMaterial({
          material_id: parseInt(this.form.material_id),
          request_quantity: parseInt(this.form.request_quantity),
          photos: photoUrls,
          attachments: attachmentUrls
        })
        
        Toast.success('物资申领成功')
        
        // 重置表单
        this.form = {
          material_id: '',
          material_name: '',
          request_quantity: '',
          category: 'production',
          photos: [],
          attachments: []
        }
        this.selectedMaterialIndex = 0
        
        // 切换到我的申领标签
        this.activeTab = 1
      } catch (error) {
        console.error(error)
        Toast.fail(error.response?.data?.message || '物资申领失败')
      } finally {
        this.loading = false
      }
    },
    
    // 上传文件方法
    async uploadFiles(files, type) {
      const urls = []
      for (const file of files) {
        if (file.file) {
          try {
            const formData = new FormData()
            formData.append('file', file.file)
            
            const response = await this.$axios.post('/api/upload/single', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${this.$store.state.token}`
              }
            })
            
            if (response.data.success) {
              urls.push(response.data.file.path)
            }
          } catch (error) {
            console.error(`${type}上传失败:`, error)
            Toast.fail(`${type === 'photo' ? '照片' : '附件'}上传失败`)
            throw error
          }
        }
      }
      return urls
    },
    
    // 照片读取完成
    onPhotosRead(file) {
      // 照片读取后的处理
      console.log('照片读取完成:', file)
    },
    
    // 照片删除
    onPhotoDelete(file, detail) {
      // 照片删除后的处理
      console.log('照片删除:', file, detail)
    },
    
    // 附件读取完成
    onAttachmentsRead(file) {
      // 附件读取后的处理
      console.log('附件读取完成:', file)
    },
    
    // 附件删除
    onAttachmentDelete(file, detail) {
      // 附件删除后的处理
      console.log('附件删除:', file, detail)
    },
    
    // 文件大小超限处理
    onOversize(file) {
      Toast.fail('照片大小不能超过5MB')
    },
    
    onAttachmentOversize(file) {
      Toast.fail('附件大小不能超过10MB')
    },
    
    async onLoad() {
      try {
        this.loading = true
        const params = {
          user_id: this.$store.state.user?.id,
          page: this.page
        }
        
        const response = await getMaterialRequests(params)
        const data = response.data
        
        this.materialRequests = this.page === 1 ? data : [...this.materialRequests, ...data]
        this.finished = data.length < 10
        this.page++
      } catch (error) {
        console.error(error)
        Toast.fail('获取申领记录失败')
      } finally {
        this.loading = false
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        pending: '待审批',
        approved: '已批准',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },
    
    getStatusType(status) {
      const typeMap = {
        pending: 'default',
        approved: 'success',
        rejected: 'danger'
      }
      return typeMap[status] || 'default'
    },
    goBack() {
      // 使用更可靠的导航方式，先尝试返回，如果失败则导航到首页
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/home')
      }
    }
  },
  watch: {
    activeTab(newTab) {
      this.page = 1
      this.finished = false
      if (newTab === 1) {
        this.materialRequests = []
        this.onLoad()
      } else if (newTab === 0) {
        // 重置表单并重新加载物资列表
        this.form = {
          material_id: '',
          material_name: '',
          request_quantity: '',
          category: 'production'
        }
        this.loadMaterialList()
      }
    }
  }
}
</script>

<style scoped>
.material-request-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.picker-container {
  background-color: #fff;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.picker-title {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}
</style>
