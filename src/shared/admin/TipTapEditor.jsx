import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { Youtube } from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { TextAlign } from '@tiptap/extension-text-align'
import { uploadImage } from '../utils/uploadImage'
import { useState, useEffect } from 'react'
import { 
  FaArrowRotateLeft, FaArrowRotateRight, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaHighlighter, 
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, 
  FaListUl, FaListOl, FaSquareCheck, FaQuoteRight, FaCode, 
  FaLink, FaImage, FaYoutube, FaLocationDot, FaMinus, FaTable, FaEraser, FaUpload, FaXmark,
  FaEye, FaPen
} from 'react-icons/fa6'
import { FontSize, LineHeight, LetterSpacing, Iframe, CustomImage } from './TipTapExtensions'

export default function TipTapEditor({ value = '', onChange }) {
  const [activeModal, setActiveModal] = useState(null) // 'link', 'image', 'youtube', 'iframe', 'table'
  const [modalData, setModalData] = useState({})
  const [imageUploadLoading, setImageUploadLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-lg bg-slate-900 text-slate-100 p-4 font-mono text-sm my-4'
          }
        }
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-accent-500',
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      }),
      CustomImage,
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: 'responsive-iframe-container rounded-xl shadow-md my-4'
        }
      }),
      Iframe,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-primary-200 my-4 w-full text-right'
        }
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      LineHeight,
      LetterSpacing,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify']
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none article-content min-h-[500px]',
        dir: 'auto'
      },
      // ponytail: Drag and Drop Image Handler
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadAndInsertImage(file)
            return true
          }
        }
        return false
      },
      // ponytail: Paste Image Handler
      handlePaste: (view, event, slice) => {
        if (event.clipboardData?.files?.length) {
          const file = event.clipboardData.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadAndInsertImage(file)
            return true
          }
        }
        return false
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  // Sync value from outside if it changes (e.g. edit mode initialization)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const uploadAndInsertImage = async (file) => {
    setImageUploadLoading(true)
    try {
      const url = await uploadImage(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      alert('فشل رفع الصورة: ' + err.message)
    } finally {
      setImageUploadLoading(false)
    }
  }

  if (!editor) return null

  // ─── Modal Triggers ───
  const openLinkModal = () => {
    const isLink = editor.isActive('link')
    const currentAttrs = isLink ? editor.getAttributes('link') : {}
    setModalData({
      url: currentAttrs.href || '',
      target: currentAttrs.target === '_blank'
    })
    setActiveModal('link')
  }

  const saveLinkModal = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    const { url, target } = modalData
    if (!url) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ 
        href: url, 
        target: target ? '_blank' : '_self' 
      }).run()
    }
    setActiveModal(null)
  }

  const openImageModal = () => {
    const isImg = editor.isActive('image')
    const currentAttrs = isImg ? editor.getAttributes('image') : {}
    setModalData({
      isEdit: isImg,
      src: currentAttrs.src || '',
      alt: currentAttrs.alt || '',
      title: currentAttrs.title || '',
      caption: currentAttrs.caption || '',
      width: currentAttrs.width || '100%',
      align: currentAttrs.align || 'center',
      uploadType: 'url'
    })
    setActiveModal('image')
  }

  const saveImageModal = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    const { src, alt, title, caption, width, align } = modalData
    if (!src) return

    if (modalData.isEdit) {
      editor.chain().focus().updateAttributes('image', {
        src, alt, title, caption, width, align
      }).run()
    } else {
      editor.chain().focus().setImage({
        src, alt, title, caption, width, align
      }).run()
    }
    setActiveModal(null)
  }

  const handleModalImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploadLoading(true)
    try {
      const url = await uploadImage(file)
      setModalData(prev => ({ ...prev, src: url }))
    } catch (err) {
      alert('فشل رفع الصورة: ' + err.message)
    } finally {
      setImageUploadLoading(false)
    }
  }

  const openYoutubeModal = () => {
    setActiveModal('youtube')
    setModalData({ url: '', width: 640, height: 360 })
  }

  const saveYoutubeModal = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    const { url, width, height } = modalData
    if (url) {
      editor.chain().focus().setYoutubeVideo({
        src: url,
        width: Number(width),
        height: Number(height)
      }).run()
    }
    setActiveModal(null)
  }

  const openIframeModal = () => {
    setActiveModal('iframe')
    setModalData({ src: '', width: '100%', height: '450' })
  }

  const saveIframeModal = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    let { src, width, height } = modalData
    if (!src) return

    // Simple Google Maps Embed Code Extraction
    if (src.includes('<iframe')) {
      const match = src.match(/src="([^"]+)"/)
      if (match) src = match[1]
    }

    editor.chain().focus().setIframe({
      src,
      width: width.toString(),
      height: height.toString()
    }).run()
    setActiveModal(null)
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  // ─── Dropdown Lists ───
  const fonts = [
    { label: 'خط ميلاف (المراعي)', value: 'Almarai' },
    { label: 'أريال (Arial)', value: 'Arial' },
    { label: 'تاهوما (Tahoma)', value: 'Tahoma' },
    { label: 'إنتير (Inter)', value: 'Inter' },
    { label: 'روبوتو (Roboto)', value: 'Roboto' },
    { label: 'آوتفت (Outfit)', value: 'Outfit' },
    { label: 'خط عريض (Georgia)', value: 'Georgia' },
    { label: 'مونو (Courier New)', value: 'Courier New' }
  ]

  const sizes = [
    { label: '12 بكسل', value: '12px' },
    { label: '14 بكسل', value: '14px' },
    { label: '16 بكسل', value: '16px' },
    { label: '18 بكسل', value: '18px' },
    { label: '20 بكسل', value: '20px' },
    { label: '24 بكسل', value: '24px' },
    { label: '30 بكسل', value: '30px' },
    { label: '36 بكسل', value: '36px' },
    { label: '48 بكسل', value: '48px' }
  ]

  const lineHeights = [
    { label: 'عادي (1.0)', value: '1' },
    { label: 'تباعد 1.15', value: '1.15' },
    { label: 'تباعد 1.25', value: '1.25' },
    { label: 'تباعد 1.5', value: '1.5' },
    { label: 'تباعد 1.75', value: '1.75' },
    { label: 'مزدوج (2.0)', value: '2' }
  ]

  const letterSpacings = [
    { label: 'ضيق (-0.05em)', value: '-0.05em' },
    { label: 'افتراضي (0em)', value: '0em' },
    { label: 'واسع (0.05em)', value: '0.05em' },
    { label: 'واسع جداً (0.15em)', value: '0.15em' }
  ]

  const colors = [
    { name: 'افتراضي', value: '#011a2c' },
    { name: 'أزرق ميلاف الداكن', value: '#023b65' },
    { name: 'ذهبي ميلاف', value: '#f5ad1c' },
    { name: 'رمادي فحمي', value: '#1e293b' },
    { name: 'أحمر داكن', value: '#ef4444' },
    { name: 'أخضر غامق', value: '#22c55e' },
    { name: 'أزرق ساطع', value: '#3b82f6' }
  ]

  const bgColors = [
    { name: 'بدون خلفية', value: '' },
    { name: 'ذهبي خفيف', value: '#fef7e6' },
    { name: 'أصفر فوسفوري', value: '#fef08a' },
    { name: 'أخضر خفيف', value: '#dcfce7' },
    { name: 'أزرق خفيف', value: '#dbeafe' },
    { name: 'أحمر خفيف', value: '#fee2e2' },
    { name: 'رمادي خفيف', value: '#f1f5f9' }
  ]

  return (
    <div className="border border-primary-100 rounded-2xl overflow-hidden bg-primary-50/10 flex flex-col shadow-inner" dir="rtl">
      
      {/* ─── Microsoft Word Ribbon-style Sticky Toolbar ─── */}
      <div className="sticky top-0 z-30 bg-white border-b border-primary-100 p-2 shadow-sm flex flex-col gap-2">
        
        {/* Row 1: Text Styling & History */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          
          {/* Section 0: Preview Toggle */}
          <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                previewMode 
                  ? 'bg-accent-500 text-white shadow-sm' 
                  : 'text-primary-500 hover:bg-primary-50'
              }`}
              title={previewMode ? "العودة للتحرير" : "معاينة المستند"}
            >
              {previewMode ? <FaPen className="w-3 h-3" /> : <FaEye className="w-3.5 h-3.5" />}
              <span>{previewMode ? 'تحرير' : 'معاينة'}</span>
            </button>
          </div>

          {!previewMode && (
            <>
              {/* Section 1: History Operations */}
              <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 text-primary-400 hover:text-accent-500 hover:bg-white disabled:opacity-40 disabled:hover:text-primary-400 rounded-lg transition"
              title="تراجع"
            >
              <FaArrowRotateLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 text-primary-400 hover:text-accent-500 hover:bg-white disabled:opacity-40 disabled:hover:text-primary-400 rounded-lg transition"
              title="إعادة"
            >
              <FaArrowRotateRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 2: Heading Selector */}
          <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <select
              className="px-2 py-1 bg-white border border-primary-100 rounded-lg text-xs font-semibold text-primary-500 focus:outline-none"
              onChange={(e) => {
                const val = e.target.value
                if (val === 'p') editor.chain().focus().setParagraph().run()
                else editor.chain().focus().toggleHeading({ level: Number(val) }).run()
              }}
              value={
                editor.isActive('heading', { level: 1 }) ? '1' :
                editor.isActive('heading', { level: 2 }) ? '2' :
                editor.isActive('heading', { level: 3 }) ? '3' :
                editor.isActive('heading', { level: 4 }) ? '4' :
                editor.isActive('heading', { level: 5 }) ? '5' :
                editor.isActive('heading', { level: 6 }) ? '6' : 'p'
              }
            >
              <option value="p">نص عادي (فقرة)</option>
              <option value="1">عنوان رئيسي 1 (H1)</option>
              <option value="2">عنوان 2 (H2)</option>
              <option value="3">عنوان 3 (H3)</option>
              <option value="4">عنوان 4 (H4)</option>
              <option value="5">عنوان 5 (H5)</option>
              <option value="6">عنوان 6 (H6)</option>
            </select>
          </div>

          {/* Section 3: Font Family & Size */}
          <div className="flex items-center gap-1.5 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            {/* Font Family Dropdown */}
            <select
              className="px-2 py-1 bg-white border border-primary-100 rounded-lg text-xs font-semibold text-primary-500 focus:outline-none"
              onChange={(e) => {
                const val = e.target.value
                if (val === 'default') editor.chain().focus().unsetFontFamily().run()
                else editor.chain().focus().setFontFamily(val).run()
              }}
              value={editor.getAttributes('textStyle').fontFamily || 'default'}
            >
              <option value="default">الخط الافتراضي</option>
              {fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>

            {/* Font Size Dropdown */}
            <select
              className="px-2 py-1 bg-white border border-primary-100 rounded-lg text-xs font-semibold text-primary-500 focus:outline-none"
              onChange={(e) => {
                const val = e.target.value
                if (val === 'default') editor.chain().focus().unsetFontSize().run()
                else editor.chain().focus().setFontSize(val).run()
              }}
              value={editor.getAttributes('textStyle').fontSize || 'default'}
            >
              <option value="default">حجم خط عادي</option>
              {sizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Section 4: Basic Formatting Style */}
          <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('bold') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="خط عريض"
            >
              <FaBold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('italic') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="خط مائل"
            >
              <FaItalic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('underline') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="تسطير"
            >
              <FaUnderline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('strike') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="يتوسطه خط"
            >
              <FaStrikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('code') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="كود برمجى مدمج"
            >
              <FaCode className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 5: Text Colors */}
          <div className="flex items-center gap-1.5 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            {/* Color select */}
            <select
              className="px-2 py-1 bg-white border border-primary-100 rounded-lg text-xs font-semibold text-primary-500 focus:outline-none"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              value={editor.getAttributes('textStyle').color || '#011a2c'}
              title="لون الخط"
            >
              {colors.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
            </select>

            {/* Background Highlight select */}
            <select
              className="px-2 py-1 bg-white border border-primary-100 rounded-lg text-xs font-semibold text-primary-500 focus:outline-none"
              onChange={(e) => {
                const val = e.target.value
                if (!val) editor.chain().focus().unsetHighlight().run()
                else editor.chain().focus().setHighlight({ color: val }).run()
              }}
              value={editor.getAttributes('highlight').color || ''}
              title="لون تمييز الخلفية"
            >
              {bgColors.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
            </select>
          </div>

          {/* Section 11: Formatting Clear */}
          <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().clearNodes().unsetAllMarks().run()
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="مسح كافة التنسيقات"
            >
              <FaEraser className="w-3.5 h-3.5" />
            </button>
          </div>
          </>
          )}

        </div>

        {/* Row 2: Layout, Lists & Media */}
        {!previewMode && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-primary-100/50">

            {/* Section 6: Text Alignment */}
            <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded-lg transition ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="محاذاة لليمين"
            >
              <FaAlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded-lg transition ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="محاذاة للوسط"
            >
              <FaAlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded-lg transition ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="محاذاة ليسار"
            >
              <FaAlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded-lg transition ${editor.isActive({ textAlign: 'justify' }) ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="ضبط النص (Justify)"
            >
              <FaAlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 7: Paragraph Spacings (Line Height & Letter Spacing) */}
          <div className="flex items-center gap-1.5 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            {/* Line Height */}
            <select
              className="px-2 py-1 bg-white border border-primary-100 rounded-lg text-xs font-semibold text-primary-500 focus:outline-none"
              onChange={(e) => {
                const val = e.target.value
                if (val === 'default') editor.chain().focus().unsetLineHeight().run()
                else editor.chain().focus().setLineHeight(val).run()
              }}
              value={editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight || '1.8'}
              title="تباعد السطور"
            >
              <option value="default">تباعد سطور تلقائي</option>
              {lineHeights.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>

            {/* Letter Spacing */}
            <select
              className="px-2 py-1 bg-white border border-primary-100 rounded-lg text-xs font-semibold text-primary-500 focus:outline-none"
              onChange={(e) => {
                const val = e.target.value
                if (val === 'default') editor.chain().focus().unsetLetterSpacing().run()
                else editor.chain().focus().setLetterSpacing(val).run()
              }}
              value={editor.getAttributes('textStyle').letterSpacing || 'default'}
              title="تباعد الحروف"
            >
              <option value="default">تباعد حروف عادي</option>
              {letterSpacings.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Section 8: Lists & Blockquote */}
          <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('bulletList') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="قائمة نقطية"
            >
              <FaListUl className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('orderedList') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="قائمة رقمية"
            >
              <FaListOl className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('taskList') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="قائمة مهام (Checklist)"
            >
              <FaSquareCheck className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('blockquote') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="اقتباس"
            >
              <FaQuoteRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded-lg transition ${editor.isActive('codeBlock') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="مطلب كود برمجي"
            >
              <span className="font-mono text-[10px] font-bold">PRE</span>
            </button>
          </div>

          {/* Section 9: Media and External Embeds */}
          <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <button
              type="button"
              onClick={openLinkModal}
              className={`p-2 rounded-lg transition ${editor.isActive('link') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="إدراج رابط"
            >
              <FaLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={openImageModal}
              className={`p-2 rounded-lg transition ${editor.isActive('image') ? 'bg-accent-500 text-white shadow-sm' : 'text-primary-400 hover:text-accent-500 hover:bg-white'}`}
              title="إدراج وصور إعدادات"
            >
              <FaImage className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={openYoutubeModal}
              className="p-2 text-primary-400 hover:text-accent-500 hover:bg-white rounded-lg transition"
              title="فيديو يوتيوب"
            >
              <FaYoutube className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={openIframeModal}
              className="p-2 text-primary-400 hover:text-accent-500 hover:bg-white rounded-lg transition"
              title="خرائط جوجل / إطار iframe"
            >
              <FaLocationDot className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 text-primary-400 hover:text-accent-500 hover:bg-white rounded-lg transition"
              title="خط فاصل أفقي"
            >
              <FaMinus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 10: Tables Creation */}
          <div className="flex items-center gap-1 bg-primary-50/40 p-1 rounded-xl border border-primary-50">
            <button
              type="button"
              onClick={insertTable}
              className="p-2 text-primary-400 hover:text-accent-500 hover:bg-white rounded-lg transition"
              title="إدراج جدول"
            >
              <FaTable className="w-3.5 h-3.5" />
            </button>
          </div>

          </div>
        )}

        {/* Conditional Table Operations Panel */}
        {editor.isActive('table') && (
          <div className="animate-fade-in flex flex-wrap items-center gap-1.5 p-1 bg-accent-50 rounded-xl border border-accent-100 text-xs">
            <span className="font-bold text-accent-700 px-2">إجراءات الجدول:</span>
            <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="px-2 py-1 bg-white hover:bg-accent-100 rounded border border-accent-200">عمود لليمين</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 bg-white hover:bg-accent-100 rounded border border-accent-200">عمود ليسار</button>
            <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 bg-white hover:bg-red-50 hover:text-red-600 rounded border border-accent-200 text-red-500">حذف عمود</button>
            <span className="text-accent-300">|</span>
            <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="px-2 py-1 bg-white hover:bg-accent-100 rounded border border-accent-200">صف لأعلى</button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 bg-white hover:bg-accent-100 rounded border border-accent-200">صف لأسفل</button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 bg-white hover:bg-red-50 hover:text-red-600 rounded border border-accent-200 text-red-500">حذف صف</button>
            <span className="text-accent-300">|</span>
            <button type="button" onClick={() => editor.chain().focus().mergeCells().run()} className="px-2 py-1 bg-white hover:bg-accent-100 rounded border border-accent-200">دمج خلايا</button>
            <button type="button" onClick={() => editor.chain().focus().splitCell().run()} className="px-2 py-1 bg-white hover:bg-accent-100 rounded border border-accent-200">تقسيم خلية</button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 rounded shadow-sm font-bold">حذف الجدول بالكامل</button>
          </div>
        )}
      </div>

      {/* Inline drag-over and loader indicator */}
      {imageUploadLoading && (
        <div className="bg-accent-50 text-accent-700 px-4 py-2 text-xs font-semibold animate-pulse border-b border-primary-100 flex items-center gap-2">
          🔄 جاري رفع الصورة وتنسيقها في السيرفر...
        </div>
      )}

      {/* ─── True WYSIWYG Document Editor Canvas ─── */}
      <div className="bg-[#f3f4f6] p-6 min-h-[600px] overflow-y-auto flex justify-center items-start">
        <div className="w-full max-w-4xl bg-white shadow-xl min-h-[750px] border border-gray-200 p-10 md:p-14 rounded-lg focus-within:ring-2 focus-within:ring-accent-500/20 transition duration-300">
          {previewMode ? (
            <div 
              className="prose prose-lg max-w-none article-content font-almarai text-right text-slate-800" 
              dir="rtl" 
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }} 
            />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
      </div>

      {/* ─── MODALS / DIALOGS ─── */}
      
      {/* 1. Link Modal */}
      {activeModal === 'link' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div 
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveLinkModal(e); } }}
            className="bg-white rounded-2xl border border-primary-100 shadow-2xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-primary-50 pb-3">
              <h3 className="font-bold text-primary-500">إضافة أو تعديل رابط التشعبي</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-primary-300 hover:text-red-500"><FaXmark /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary-400 mb-1">الرابط الإلكتروني (URL)</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                  value={modalData.url || ''}
                  onChange={(e) => setModalData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="link-target"
                  className="rounded text-accent-500 focus:ring-accent-500"
                  checked={modalData.target || false}
                  onChange={(e) => setModalData(prev => ({ ...prev, target: e.target.checked }))}
                />
                <label htmlFor="link-target" className="text-xs text-primary-400 font-bold select-none cursor-pointer">فتح في نافذة جديدة (_blank)</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-primary-50 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-primary-100 rounded-xl text-xs font-bold text-primary-400 hover:bg-primary-50">إلغاء</button>
              <button type="button" onClick={saveLinkModal} className="px-4 py-2 bg-accent-500 text-white rounded-xl text-xs font-bold hover:bg-accent-600">حفظ الرابط</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Image Modal */}
      {activeModal === 'image' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div 
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveImageModal(e); } }}
            className="bg-white rounded-2xl border border-primary-100 shadow-2xl p-6 w-full max-w-lg space-y-4"
          >
            <div className="flex items-center justify-between border-b border-primary-50 pb-3">
              <h3 className="font-bold text-primary-500">{modalData.isEdit ? 'تعديل خصائص الصورة' : 'إدراج صورة جديدة'}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-primary-300 hover:text-red-500"><FaXmark /></button>
            </div>
            
            <div className="space-y-3">
              {!modalData.isEdit && (
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">مصدر الصورة</label>
                  <div className="flex bg-primary-50 p-1 rounded-xl text-xs font-semibold mb-2">
                    <button
                      type="button"
                      className={`flex-1 py-1.5 rounded-lg text-center transition ${modalData.uploadType === 'url' ? 'bg-white text-primary-900 shadow-sm' : 'text-primary-400'}`}
                      onClick={() => setModalData(prev => ({ ...prev, uploadType: 'url' }))}
                    >
                      رابط خارجي
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-1.5 rounded-lg text-center transition ${modalData.uploadType === 'file' ? 'bg-white text-primary-900 shadow-sm' : 'text-primary-400'}`}
                      onClick={() => setModalData(prev => ({ ...prev, uploadType: 'file' }))}
                    >
                      رفع ملف محلي
                    </button>
                  </div>
                </div>
              )}

              {modalData.uploadType === 'file' ? (
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">اختر ملف الصورة *</label>
                  <div className="border-2 border-dashed border-primary-100 rounded-xl p-3 flex flex-col items-center justify-center hover:border-accent-500 bg-primary-50/10 cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleModalImageUpload}
                    />
                    <FaUpload className="w-6 h-6 text-primary-300 mb-1" />
                    <span className="text-xs text-primary-400 font-bold">{modalData.src ? 'تم رفع الصورة بنجاح!' : 'اضغط لاختيار صورة'}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">رابط الصورة (URL) *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.src || ''}
                    onChange={(e) => setModalData(prev => ({ ...prev, src: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">نص الصورة البديل (Alt)</label>
                  <input
                    type="text"
                    placeholder="وصف الصورة لمحركات البحث"
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.alt || ''}
                    onChange={(e) => setModalData(prev => ({ ...prev, alt: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">عنوان الصورة (Title)</label>
                  <input
                    type="text"
                    placeholder="عنوان الصورة الإرشادي"
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.title || ''}
                    onChange={(e) => setModalData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary-400 mb-1">شرح الصورة المكتوب (Caption)</label>
                <input
                  type="text"
                  placeholder="نص يظهر أسفل الصورة مباشرة..."
                  className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                  value={modalData.caption || ''}
                  onChange={(e) => setModalData(prev => ({ ...prev, caption: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">حجم العرض (Width)</label>
                  <select
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.width || '100%'}
                    onChange={(e) => setModalData(prev => ({ ...prev, width: e.target.value }))}
                  >
                    <option value="100%">عرض كامل (100%)</option>
                    <option value="75%">كبير (75%)</option>
                    <option value="50%">متوسط (50%)</option>
                    <option value="25%">صغير (25%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">المحاذاة (Alignment)</label>
                  <select
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.align || 'center'}
                    onChange={(e) => setModalData(prev => ({ ...prev, align: e.target.value }))}
                  >
                    <option value="center">في المنتصف</option>
                    <option value="right">أقصى اليمين</option>
                    <option value="left">أقصى اليسار</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t border-primary-50 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-primary-100 rounded-xl text-xs font-bold text-primary-400 hover:bg-primary-50">إلغاء</button>
              <button type="button" onClick={saveImageModal} disabled={imageUploadLoading} className="px-4 py-2 bg-accent-500 text-white rounded-xl text-xs font-bold hover:bg-accent-600">
                {imageUploadLoading ? 'جاري الرفع...' : modalData.isEdit ? 'تحديث الصورة' : 'إدراج الصورة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. YouTube Modal */}
      {activeModal === 'youtube' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div 
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveYoutubeModal(e); } }}
            className="bg-white rounded-2xl border border-primary-100 shadow-2xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-primary-50 pb-3">
              <h3 className="font-bold text-primary-500">إدراج فيديو YouTube</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-primary-300 hover:text-red-500"><FaXmark /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary-400 mb-1">رابط الفيديو أو رابط المشاركة *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                  value={modalData.url || ''}
                  onChange={(e) => setModalData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">العرض (px)</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.width || 640}
                    onChange={(e) => setModalData(prev => ({ ...prev, width: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">الارتفاع (px)</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.height || 360}
                    onChange={(e) => setModalData(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-primary-50 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-primary-100 rounded-xl text-xs font-bold text-primary-400 hover:bg-primary-50">إلغاء</button>
              <button type="button" onClick={saveYoutubeModal} className="px-4 py-2 bg-accent-500 text-white rounded-xl text-xs font-bold hover:bg-accent-600">إدراج الفيديو</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Iframe / Google Maps Modal */}
      {activeModal === 'iframe' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div 
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveIframeModal(e); } }}
            className="bg-white rounded-2xl border border-primary-100 shadow-2xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-primary-50 pb-3">
              <h3 className="font-bold text-primary-500">إدراج خريطة جوجل / كود iframe</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-primary-300 hover:text-red-500"><FaXmark /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary-400 mb-1">كود المشاركة iframe أو الرابط المباشر *</label>
                <textarea
                  rows={4}
                  required
                  placeholder='أو الصق كود iframe من مشاركة الخريطة: <iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                  className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                  value={modalData.src || ''}
                  onChange={(e) => setModalData(prev => ({ ...prev, src: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">العرض</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.width || '100%'}
                    onChange={(e) => setModalData(prev => ({ ...prev, width: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-400 mb-1">الارتفاع (بكسل)</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 text-sm text-primary-500 focus:outline-none focus:border-accent-500"
                    value={modalData.height || 450}
                    onChange={(e) => setModalData(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-primary-50 pt-4">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 border border-primary-100 rounded-xl text-xs font-bold text-primary-400 hover:bg-primary-50">إلغاء</button>
              <button type="button" onClick={saveIframeModal} className="px-4 py-2 bg-accent-500 text-white rounded-xl text-xs font-bold hover:bg-accent-600">إدراج الإطار</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
